import type { AchievementId } from '@/data/progression/achievements';
import { useCardsStore } from '@/stores/cardsStore';
import { useProgressionStore } from '@/stores/progressionStore';
import type { CombatState } from '@/engine/combat/types';
import type { RewardBundle } from './types';

export type PostFightSummary = {
  won: boolean;
  winnerId: string | null;
  turns: number;
  rewards: RewardBundle;
  // Snapshot before vs after for clean debug display
  before: { level: number; xp: number; coins: number };
  after: { level: number; xp: number; coins: number };
  levelsGained: number;
  newAchievements: AchievementId[];
  unlockedCardIds: string[];
};

/**
 * One entry point that closes the gameplay loop:
 *   fight (CombatState) -> rewards -> progression update -> card unlocks.
 *
 * No UI; returns a summary the screen can render however it likes.
 */
export async function processFightResult(args: {
  state: CombatState;
  playerId: string;
  seed: number;
}): Promise<PostFightSummary> {
  const progression = useProgressionStore.getState();
  const cards = useCardsStore.getState();

  const before = {
    level: progression.level,
    xp: progression.xp,
    coins: progression.currencies.coins,
  };

  const award = await progression.awardFightRewards({
    state: args.state,
    playerId: args.playerId,
    seed: args.seed,
    ownedCardCount: Object.keys(cards.owned).length,
  });

  // Drop cards into the collection.
  for (const cardId of award.rewards.cardDrops) {
    // eslint-disable-next-line no-await-in-loop
    await cards.unlockCard(cardId, 1);
  }

  const after = useProgressionStore.getState();

  // Roll the deterministic discovery drip (silhouettes appearing in the
  // collection between owned drops). Delegates entirely to the discovery
  // service; postFight only supplies the totals.
  const newlyDiscovered = await useCardsStore
    .getState()
    .rollFightDiscoveries(after.totals.fights, after.level);

  return {
    won: args.state.winnerId === args.playerId,
    winnerId: args.state.winnerId,
    turns: args.state.turn,
    rewards: award.rewards,
    before,
    after: { level: after.level, xp: after.xp, coins: after.currencies.coins },
    levelsGained: award.levelsGained,
    newAchievements: award.newAchievements,
    unlockedCardIds: award.rewards.cardDrops,
  };
}
