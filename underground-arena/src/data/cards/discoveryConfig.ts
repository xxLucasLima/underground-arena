import type { CardRarity } from '@/types/cards';

/**
 * Discovery system configuration — purely declarative.
 *
 * Designers tune the visibility funnel by editing this file only. The
 * service layer reads these values; no UI or store code references magic
 * numbers.
 */
export const DISCOVERY_CONFIG = {
  /**
   * Cards always visible (at least Discovered) from the very first session.
   * These provide a baseline collection silhouette so the page never feels empty.
   */
  initialDiscoveredIds: [
    'punch_jab_01',
    'punch_cross_01',
    'kick_low_01',
    'kick_teep_01',
    'grapple_clinch_01',
    'grapple_double_leg_01',
    'defense_shell_01',
    'defense_slip_01',
    'counter_slip_cross_01',
    'punch_hook_01',
  ] as string[],
  /**
   * Cards owned at game start (Owned implies Discovered).
   * Kept in sync with the cardsStore starter set.
   */
  initialOwnedIds: ['punch_jab_01', 'kick_low_01', 'grapple_clinch_01', 'defense_shell_01'] as string[],
  /**
   * When the player reaches one of these levels, all cards whose
   * `unlockLevel <= level` are auto-discovered (silhouettes appear).
   * This gives a steady drip of "new tease cards appearing" feedback.
   */
  discoverByLevelUp: true,
  /**
   * After this many fights, low-rarity cards of the player's archetype get auto-discovered.
   * 0 disables the time-based drip.
   */
  discoverFightInterval: 3,
  /**
   * Rarity multipliers for the discoverFightInterval drip — higher rarities
   * are revealed less often, preserving rarity excitement.
   */
  fightDiscoveryRarityWeight: {
    Common: 1.0,
    Rare: 0.6,
    Epic: 0.25,
    Legendary: 0.0,
  } as Record<CardRarity, number>,
} as const;
