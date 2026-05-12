import type { CardRarity } from '@/types/cards';

export type RewardTier = 'bronze' | 'silver' | 'gold' | 'diamond';

/**
 * Weights for random card drop rarity per reward tier.
 * Uses { value, weight } shape to be consumable by pickWeighted.
 */
export const CARD_DROP_WEIGHTS: Record<RewardTier, Array<{ value: CardRarity; weight: number }>> = {
  bronze:  [{ value: 'Common', weight: 80 }, { value: 'Rare', weight: 18 }, { value: 'Epic', weight: 2 }],
  silver:  [{ value: 'Common', weight: 60 }, { value: 'Rare', weight: 30 }, { value: 'Epic', weight: 9 }, { value: 'Legendary', weight: 1 }],
  gold:    [{ value: 'Common', weight: 30 }, { value: 'Rare', weight: 45 }, { value: 'Epic', weight: 22 }, { value: 'Legendary', weight: 3 }],
  diamond: [{ value: 'Common', weight: 10 }, { value: 'Rare', weight: 35 }, { value: 'Epic', weight: 45 }, { value: 'Legendary', weight: 10 }],
};

export const BASE_FIGHT_XP = 30;
