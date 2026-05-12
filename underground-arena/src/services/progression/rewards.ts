import { BASE_FIGHT_XP, CARD_DROP_WEIGHTS, type RewardTier } from '@/data/progression/rewards';
import { ECONOMY_CONFIG } from '@/data/progression/economyConfig';
import { LEAGUES, type LeagueId } from '@/data/progression/leagues';
import { CARD_DEFINITIONS } from '@/data/cards';
import { createRng, pickWeighted, type RNG } from '@/engine/combat/rng';
import type { CombatState } from '@/engine/combat/types';
import { streakBonus } from './economy';
import type { FightOutcome, RewardBundle } from './types';

const TIER_BY_LEAGUE: Record<LeagueId, RewardTier> = {
  amateur: 'bronze',
  underground: 'bronze',
  regional: 'silver',
  national: 'silver',
  elite: 'gold',
  world: 'diamond',
};

/** Extracts a structured FightOutcome from raw combat output. */
export function buildFightOutcome(args: {
  state: CombatState;
  playerId: string;
  league: LeagueId;
  opponentPower: number;
}): FightOutcome {
  const { state, playerId } = args;
  const won = state.winnerId === playerId;
  const opponentId = Object.keys(state.fighters).find((id) => id !== playerId)!;
  const opponentRuntime = state.fighters[opponentId];
  const playerRuntime = state.fighters[playerId];
  const finisher = won ? opponentRuntime.finisher : null;
  const flawless = won && playerRuntime.hp >= Math.round(state.profiles[playerId].maxHp * 0.9);
  return { won, finisher, flawless, league: args.league, opponentPower: args.opponentPower };
}

/** Generates a reward bundle from a fight outcome. Deterministic given the seed. */
export function generateFightRewards(args: {
  seed: number;
  outcome: FightOutcome;
  playerLevel: number;
  streak: number;
}): RewardBundle {
  const rng: RNG = createRng(args.seed);
  const league = LEAGUES.find((l) => l.id === args.outcome.league)!;

  const baseXp = BASE_FIGHT_XP * league.xpMultiplier;
  const xp = Math.round(baseXp * (args.outcome.won ? 1.5 : 0.5) + args.outcome.opponentPower * 0.4);

  let coins = Math.round(ECONOMY_CONFIG.fightBaseCoins * league.coinMultiplier);
  if (args.outcome.won) coins += ECONOMY_CONFIG.fightWinBonus;
  if (args.outcome.finisher === 'KO') coins += ECONOMY_CONFIG.fightKoBonus;
  if (args.outcome.finisher === 'Submission') coins += ECONOMY_CONFIG.fightSubmissionBonus;
  if (args.outcome.flawless) coins += ECONOMY_CONFIG.fightFlawlessBonus;
  if (args.outcome.won) coins += streakBonus(args.streak);

  // Card drops scale with reward tier; non-wins still get a small consolation chance.
  const tier = TIER_BY_LEAGUE[args.outcome.league];
  const dropChance = args.outcome.won ? 0.6 : 0.15;
  const cardDrops: string[] = [];
  if (rng() < dropChance) {
    const rarity = pickWeighted(rng, CARD_DROP_WEIGHTS[tier]);
    const pool = CARD_DEFINITIONS.filter((c) => c.rarity === rarity);
    void rarity;
    if (pool.length > 0) {
      const card = pool[Math.floor(rng() * pool.length)];
      cardDrops.push(card.id);
    }
  }

  return { xp, coins, cardDrops };
}
