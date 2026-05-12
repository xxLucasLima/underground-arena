import type { LeagueId } from '@/data/progression/leagues';
import type { RewardBundle } from '@/services/progression/types';

/**
 * Daily challenges are *templates*; the daily-challenge service picks N of
 * them using a date-seeded RNG so all players see the same daily set,
 * but the *opponent details* are still personalized via the player's seed.
 *
 *  - `restriction` is interpreted by the service when generating the
 *    matchup (e.g., "no_punches" -> reduce 'Punch' category weight in the
 *    archetype temporarily).
 *  - `modifier` is a small tweak passed straight into the generator
 *    (difficulty drift).
 */
export type DailyRestriction =
  | 'no_punches'
  | 'no_kicks'
  | 'only_grappling'
  | 'no_ultimates'
  | 'low_stamina'
  | 'small_deck';

export type DailyChallengeTemplate = {
  id: string;
  name: string;
  description: string;
  league: LeagueId;
  restriction: DailyRestriction;
  difficultyDrift: number;
  reward: RewardBundle;
};

export const DAILY_CHALLENGE_TEMPLATES: DailyChallengeTemplate[] = [
  {
    id: 'no-fists',
    name: 'No Fists',
    description: 'Win a fight without using punches.',
    league: 'underground',
    restriction: 'no_punches',
    difficultyDrift: 0.0,
    reward: { coins: 150, xp: 60, cardDrops: [] },
  },
  {
    id: 'all-out-strike',
    name: 'All-Out Strike',
    description: 'Win using only striking cards.',
    league: 'underground',
    restriction: 'only_grappling', // service inverts as needed
    difficultyDrift: 0.02,
    reward: { coins: 180, xp: 70, cardDrops: [] },
  },
  {
    id: 'grappler-only',
    name: 'Ground Game',
    description: 'Win using grappling/submissions.',
    league: 'regional',
    restriction: 'only_grappling',
    difficultyDrift: 0.03,
    reward: { coins: 220, xp: 85, cardDrops: [] },
  },
  {
    id: 'low-stamina',
    name: 'Empty Tank',
    description: 'Start the fight at half stamina.',
    league: 'regional',
    restriction: 'low_stamina',
    difficultyDrift: 0.0,
    reward: { coins: 200, xp: 75, cardDrops: [] },
  },
  {
    id: 'small-deck',
    name: 'Travel Light',
    description: 'Fight with a 5-card deck.',
    league: 'national',
    restriction: 'small_deck',
    difficultyDrift: 0.02,
    reward: { coins: 260, xp: 90, cardDrops: [] },
  },
  {
    id: 'no-ultimates',
    name: 'No Finishers',
    description: 'Win without using any Ultimate.',
    league: 'national',
    restriction: 'no_ultimates',
    difficultyDrift: 0.04,
    reward: { coins: 280, xp: 95, cardDrops: [] },
  },
];

/** How many challenges to surface per day. */
export const DAILY_CHALLENGE_COUNT = 3;
