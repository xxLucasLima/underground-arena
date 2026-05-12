import type { LeagueId } from '@/data/progression/leagues';
import type { RewardBundle } from '@/services/progression/types';

/**
 * Tournament templates define *what* a tournament looks like; the engine
 * instantiates a TournamentRun from a template + seed.
 *
 *  - `rounds`: power-of-two bracket size = 2^rounds matches in round 1.
 *      rounds:3 → 8 fighters, 7 matches, 3 rounds (quarter/semi/final).
 *  - `rewardsPerRound`: cumulative rewards on completing each round.
 *      Index 0 = round-1 win, etc. The final entry is the championship purse.
 *  - `difficultyCurve`: applied as `tierBoost` to each round (rookie -> elite).
 *      The opponent generator handles the math, this is just a per-round
 *      `difficultyDrift` value.
 */
export type TournamentTemplateId =
  | 'amateur-cup'
  | 'knockout-tournament'
  | 'elite-grand-prix'
  | 'survival-gauntlet'
  | 'underground-championship';

export type TournamentTemplate = {
  id: TournamentTemplateId;
  name: string;
  league: LeagueId;
  unlockLevel: number;
  entryFee: number;
  rounds: number; // bracket depth (3 => 8-fighter bracket)
  difficultyCurve: number[]; // per-round difficultyDrift
  rewardsPerRound: RewardBundle[];
  /** Optional flavor used by UI/summary screens. */
  description: string;
};

const reward = (coins: number, xp: number, cardDrops: string[] = []): RewardBundle => ({
  coins,
  xp,
  cardDrops,
});

export const TOURNAMENT_TEMPLATES: TournamentTemplate[] = [
  {
    id: 'amateur-cup',
    name: 'Amateur Cup',
    league: 'amateur',
    unlockLevel: 2,
    entryFee: 50,
    rounds: 2,
    difficultyCurve: [-0.05, 0.0, 0.05],
    rewardsPerRound: [reward(80, 30), reward(180, 70), reward(400, 150)],
    description: 'Three quick fights to test your fundamentals.',
  },
  {
    id: 'knockout-tournament',
    name: 'Knockout Tournament',
    league: 'underground',
    unlockLevel: 8,
    entryFee: 150,
    rounds: 3,
    difficultyCurve: [0.0, 0.03, 0.06, 0.08],
    rewardsPerRound: [reward(120, 50), reward(260, 100), reward(500, 200), reward(900, 400)],
    description: 'Pure striking. KO or be KOd.',
  },
  {
    id: 'elite-grand-prix',
    name: 'Elite Grand Prix',
    league: 'national',
    unlockLevel: 22,
    entryFee: 400,
    rounds: 3,
    difficultyCurve: [0.04, 0.06, 0.08, 0.10],
    rewardsPerRound: [reward(220, 80), reward(450, 180), reward(850, 350), reward(1800, 700)],
    description: 'National stage. Power, skill, prestige.',
  },
  {
    id: 'survival-gauntlet',
    name: 'Survival Gauntlet',
    league: 'underground',
    unlockLevel: 6,
    entryFee: 100,
    rounds: 4, // 16-fighter feeling
    difficultyCurve: [0.0, 0.03, 0.05, 0.08, 0.10],
    rewardsPerRound: [reward(80, 40), reward(160, 80), reward(320, 160), reward(640, 320), reward(1200, 600)],
    description: 'Sixteen-fighter free-for-all bracket. Last one standing.',
  },
  {
    id: 'underground-championship',
    name: 'Underground Championship',
    league: 'elite',
    unlockLevel: 35,
    entryFee: 1000,
    rounds: 3,
    difficultyCurve: [0.06, 0.08, 0.10, 0.12],
    rewardsPerRound: [reward(400, 150), reward(800, 300), reward(1500, 600), reward(3500, 1500)],
    description: 'The crown jewel. Champions only.',
  },
];

export function getTemplate(id: TournamentTemplateId): TournamentTemplate | undefined {
  return TOURNAMENT_TEMPLATES.find((t) => t.id === id);
}
