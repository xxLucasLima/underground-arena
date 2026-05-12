import type { LeagueId } from '@/data/progression/leagues';
import type { OpponentTier } from './opponentConfig';
import type { CardRarity } from '@/types/cards';

/**
 * Bosses are *seeds*, not full fighters. The opponent generator uses the seed
 * to deterministically build the actual fighter — meaning bosses still benefit
 * from the generic generation pipeline, but they always feel signature.
 *
 * - `seed` is the deterministic input (same seed -> same exact fighter).
 * - `tier` overrides the league's tier roll.
 * - `forcedCardIds` are cards the boss MUST run (signature mechanics).
 * - `statMultiplier` is a small additional bump on top of tier scale (0..0.15).
 * - `legendaryFloor` forces the deck rolls to keep ≥ N legendaries when allowed.
 */
export type BossDefinition = {
  id: string;
  league: LeagueId;
  unlockAfterFights: number;
  name: string;
  nickname: string;
  archetypeId: string;
  tier: OpponentTier;
  seed: number;
  signature: string; // short narrative tag
  forcedCardIds: string[];
  statMultiplier: number;
  legendaryFloor: number;
  /** Minimum rarity bump applied per slot (helps signature builds shine). */
  minRarity?: CardRarity;
};

export const BOSSES: BossDefinition[] = [
  {
    id: 'boss-amateur-king',
    league: 'amateur',
    unlockAfterFights: 5,
    name: 'Otis Granger',
    nickname: 'The Amateur King',
    archetypeId: 'brawler',
    tier: 'contender',
    seed: 101,
    signature: 'Won 12 underground brawls in a single night.',
    forcedCardIds: [],
    statMultiplier: 0.05,
    legendaryFloor: 0,
  },
  {
    id: 'boss-underground-warden',
    league: 'underground',
    unlockAfterFights: 15,
    name: 'Sergei Volkov',
    nickname: 'The Warden',
    archetypeId: 'grappler',
    tier: 'veteran',
    seed: 202,
    signature: 'Famous for breaking opponents in the clinch.',
    forcedCardIds: [],
    statMultiplier: 0.08,
    legendaryFloor: 0,
  },
  {
    id: 'boss-regional-cobra',
    league: 'regional',
    unlockAfterFights: 25,
    name: 'Mateo Reyes',
    nickname: 'The Cobra',
    archetypeId: 'submission-specialist',
    tier: 'veteran',
    seed: 303,
    signature: 'Has never lost on the ground.',
    forcedCardIds: [],
    statMultiplier: 0.1,
    legendaryFloor: 1,
    minRarity: 'Rare',
  },
  {
    id: 'boss-national-surgeon',
    league: 'national',
    unlockAfterFights: 40,
    name: 'Adrian Strauss',
    nickname: 'The Surgeon',
    archetypeId: 'tactician',
    tier: 'elite',
    seed: 404,
    signature: 'Picks opponents apart, round by round.',
    forcedCardIds: [],
    statMultiplier: 0.1,
    legendaryFloor: 1,
    minRarity: 'Rare',
  },
  {
    id: 'boss-elite-phantom',
    league: 'elite',
    unlockAfterFights: 60,
    name: 'Felix Halsey',
    nickname: 'The Phantom',
    archetypeId: 'counter-puncher',
    tier: 'elite',
    seed: 505,
    signature: 'You will never see the punch that ends it.',
    forcedCardIds: [],
    statMultiplier: 0.12,
    legendaryFloor: 1,
    minRarity: 'Rare',
  },
  {
    id: 'boss-world-titan',
    league: 'world',
    unlockAfterFights: 90,
    name: 'Dimitri Drago',
    nickname: 'The Last Titan',
    archetypeId: 'heavy-striker',
    tier: 'champion',
    seed: 606,
    signature: 'Undefeated World Champion. Retired no one alive.',
    forcedCardIds: [],
    statMultiplier: 0.15,
    legendaryFloor: 2,
    minRarity: 'Epic',
  },
];

export function getBossesForLeague(league: LeagueId): BossDefinition[] {
  return BOSSES.filter((b) => b.league === league);
}
