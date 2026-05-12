import type { CardDefinition, CardRarity } from '@/types/cards';
import { CARD_DEFINITIONS } from '@/data/cards';
import { createRng, pickWeighted, type RNG } from '@/engine/combat/rng';
import type { AIPersonality, FighterProfile, FighterStats } from '@/engine/combat/types';
import { ARCHETYPES, getArchetype, type FighterArchetype } from '@/data/opponents/archetypes';
import { FIRST_NAMES, LAST_NAMES, NICKNAME_ADJ, NICKNAME_NOUN } from '@/data/opponents/namePools';
import {
  DIFFICULTY_DRIFT,
  LEAGUE_TIER_WEIGHTS,
  TIER_HP,
  TIER_STAMINA,
  TIER_STAT_SCALE,
  type OpponentTier,
} from '@/data/opponents/opponentConfig';
import type { LeagueId } from '@/data/progression/leagues';
import { getBossesForLeague, type BossDefinition } from '@/data/opponents/bosses';
import { generateDeck, estimateDeckPower } from './deckGenerator';
import type { AIFighter, MatchmakingContext } from './types';

/**
 * Deterministically generate one AI fighter from a seed + context.
 *
 * Determinism contract:
 *   same (seed, league, archetypeId, tier, effectiveLevel) -> same fighter.
 *
 * The generator NEVER reads from any store. All inputs come from the caller —
 * this keeps it trivially testable and reusable from any feature (story
 * fights, tournaments, survival mode, rivals, daily challenges...).
 */
export function generateAIFighter(args: {
  seed: number;
  league: LeagueId;
  /** When omitted, an archetype is rolled from the full pool. */
  archetypeId?: string;
  /** When omitted, tier is rolled from league weights. */
  tier?: OpponentTier;
  /** Effective level used for card pool filtering. Defaults to player-level. */
  effectiveLevel: number;
  /** Optional difficulty drift in [-1, +1] applied as small stat nudge. */
  difficultyDrift?: number;
  pool?: CardDefinition[];
  /** When provided (bosses), forces stat bonuses & deck constraints. */
  boss?: BossDefinition;
}): AIFighter {
  const rng = createRng(args.seed);
  const pool = args.pool ?? CARD_DEFINITIONS;

  const archetype: FighterArchetype = (() => {
    if (args.boss) return getArchetype(args.boss.archetypeId) ?? ARCHETYPES[0];
    if (args.archetypeId) return getArchetype(args.archetypeId) ?? rollArchetype(rng);
    return rollArchetype(rng);
  })();

  const tier: OpponentTier = args.boss?.tier ?? args.tier ?? rollTier(rng, args.league);

  const personality: AIPersonality =
    archetype.personalityPool[Math.floor(rng() * archetype.personalityPool.length)];

  const drift = clamp(
    args.difficultyDrift ?? 0,
    DIFFICULTY_DRIFT.minScale - 1,
    DIFFICULTY_DRIFT.maxScale - 1,
  );
  const scale = TIER_STAT_SCALE[tier] * (1 + drift) * (1 + (args.boss?.statMultiplier ?? 0));
  const stats = scaleStats(archetype.statBias, scale);

  const deck = generateDeck({
    rng,
    pool,
    archetype,
    tier,
    effectiveLevel: args.effectiveLevel,
    minRarity: args.boss?.minRarity,
    legendaryFloor: args.boss?.legendaryFloor,
    forcedCardIds: args.boss?.forcedCardIds,
  });

  const { firstName, lastName, nickname } = args.boss
    ? { firstName: args.boss.name.split(' ')[0], lastName: args.boss.name.split(' ').slice(1).join(' '), nickname: args.boss.nickname }
    : rollName(rng, archetype);

  const id = `ai-${args.seed}`;
  const profile: FighterProfile = {
    id,
    name: `${firstName} "${nickname}" ${lastName}`.trim(),
    stats,
    personality,
    deck,
    maxHp: TIER_HP[tier],
    maxStamina: TIER_STAMINA[tier],
  };

  return {
    profile,
    meta: {
      nickname,
      archetypeId: archetype.id,
      fightingStyle: archetype.fightingStyle,
      league: args.league,
      tier,
      rarity: args.boss ? 'Boss' : 'Standard',
      portrait: `portrait-${archetype.id}`,
      seed: args.seed,
      bossId: args.boss?.id,
    },
  };
}

/** Soft, capped difficulty drift derived from recent fight outcomes. */
export function computeDifficultyDrift(ctx: MatchmakingContext): number {
  const window = ctx.recentResults.slice(-DIFFICULTY_DRIFT.streakWindow);
  if (window.length < DIFFICULTY_DRIFT.streakWindow) return 0;
  const wins = window.filter((r) => r.won).length;
  if (wins === window.length) return DIFFICULTY_DRIFT.hotStreakBoost;
  if (wins === 0) return DIFFICULTY_DRIFT.coldStreakRelief;
  return 0;
}

/** Quick power score (HP + stat sum + deck damage) used by matchmaking. */
export function estimateFighterPower(f: AIFighter): number {
  const s = f.profile.stats;
  return (
    f.profile.maxHp * 0.6 +
    (s.strength + s.speed + s.cardio + s.technique + s.defense + s.chin) * 0.7 +
    estimateDeckPower(f.profile.deck) * 0.3
  );
}

// --- internal helpers ---------------------------------------------------

function rollArchetype(rng: RNG): FighterArchetype {
  return ARCHETYPES[Math.floor(rng() * ARCHETYPES.length) % ARCHETYPES.length];
}

function rollTier(rng: RNG, league: LeagueId): OpponentTier {
  const weights = LEAGUE_TIER_WEIGHTS[league];
  return pickWeighted(rng, weights.map((w) => ({ value: w.tier, weight: w.weight })));
}

function scaleStats(base: FighterStats, scale: number): FighterStats {
  return {
    strength: Math.round(base.strength * scale),
    speed: Math.round(base.speed * scale),
    cardio: Math.round(base.cardio * scale),
    technique: Math.round(base.technique * scale),
    defense: Math.round(base.defense * scale),
    chin: Math.round(base.chin * scale),
    aggression: Math.round(base.aggression * scale),
  };
}

function rollName(rng: RNG, archetype: FighterArchetype) {
  const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];

  // Prefer adj/noun whose tags overlap with archetype.nicknameTags; fall back
  // to any of them so unusual archetypes still produce a nickname.
  const adjPool = NICKNAME_ADJ.filter((a) => a.tags.some((t) => archetype.nicknameTags.includes(t)) || a.tags.includes('generic'));
  const nounPool = NICKNAME_NOUN.filter((n) => n.tags.some((t) => archetype.nicknameTags.includes(t)));
  const adj = (adjPool.length > 0 ? adjPool : NICKNAME_ADJ)[Math.floor(rng() * (adjPool.length || NICKNAME_ADJ.length))];
  const noun = (nounPool.length > 0 ? nounPool : NICKNAME_NOUN)[Math.floor(rng() * (nounPool.length || NICKNAME_NOUN.length))];
  const nickname = `${adj.word} ${noun.word}`.trim();
  return { firstName, lastName, nickname };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Optional helper so callers don't have to import CARD_DATABASE everywhere. */
export function defaultRarityFor(tier: OpponentTier): CardRarity {
  switch (tier) {
    case 'rookie':
    case 'contender':
      return 'Common';
    case 'veteran':
      return 'Rare';
    case 'elite':
      return 'Epic';
    case 'champion':
      return 'Legendary';
  }
}
