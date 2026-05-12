import { createRng } from '@/engine/combat/rng';
import {
  getTemplate,
  type TournamentTemplate,
  type TournamentTemplateId,
} from '@/data/tournaments/tournamentTemplates';
import { generateAIFighter } from '@/services/opponents/fighterGenerator';
import type { AIFighter } from '@/services/opponents/types';
import type { RewardBundle } from '@/services/progression/types';

/**
 * Tournament Engine — bracket flow, no UI, no persistence internals.
 *
 * Architectural choices:
 *  - A `TournamentRun` is the *full* materialized state (seed, bracket, current
 *    round). Stores can persist it as-is; UIs can render it as-is.
 *  - The engine pre-generates ALL bracket opponents at startTournament() using
 *    a deterministic seed. The player can rematch a round and the opponent
 *    will be identical (good UX), unless the caller chooses to regenerate.
 *  - The simulation of fights is NOT part of this engine; the combat engine
 *    consumes `currentOpponent().profile` and reports back via `recordResult`.
 *
 * State machine:
 *   pending → in-progress → completed | eliminated
 */

export type TournamentMatch = {
  round: number; // 0-indexed
  index: number; // 0-indexed within round
  opponent: AIFighter;
  /** null = not played yet. */
  result: 'win' | 'loss' | null;
};

export type TournamentRun = {
  id: string; // unique per run (template + seed)
  templateId: TournamentTemplateId;
  seed: number;
  bracket: TournamentMatch[];
  currentRound: number;
  state: 'in-progress' | 'completed' | 'eliminated';
  /** Rewards already earned this run (sum of completed rounds). */
  earnedRewards: RewardBundle;
};

export function startTournament(args: {
  templateId: TournamentTemplateId;
  seed: number;
  playerLevel: number;
}): TournamentRun {
  const template = getTemplate(args.templateId);
  if (!template) throw new Error(`Unknown tournament template: ${args.templateId}`);
  const bracket = buildBracket(template, args.seed, args.playerLevel);
  return {
    id: `${template.id}-${args.seed}`,
    templateId: template.id,
    seed: args.seed,
    bracket,
    currentRound: 0,
    state: 'in-progress',
    earnedRewards: { coins: 0, xp: 0, cardDrops: [] },
  };
}

/** Returns the next match the player must fight, or null if finished. */
export function currentMatch(run: TournamentRun): TournamentMatch | null {
  if (run.state !== 'in-progress') return null;
  return run.bracket.find((m) => m.round === run.currentRound && m.result === null) ?? null;
}

/**
 * Record the outcome of the current match. Returns the new run state
 * (immutable update). Caller is responsible for telling the rest of the game
 * to award `earnedRewards` deltas — this engine doesn't touch progression.
 */
export function recordResult(
  run: TournamentRun,
  args: { won: boolean },
): { run: TournamentRun; awarded: RewardBundle } {
  const template = getTemplate(run.templateId);
  if (!template) throw new Error('Unknown template');

  const match = currentMatch(run);
  if (!match) return { run, awarded: { coins: 0, xp: 0, cardDrops: [] } };

  const updatedMatch: TournamentMatch = { ...match, result: args.won ? 'win' : 'loss' };
  const newBracket = run.bracket.map((m) =>
    m.round === match.round && m.index === match.index ? updatedMatch : m,
  );

  if (!args.won) {
    return {
      run: { ...run, bracket: newBracket, state: 'eliminated' },
      awarded: { coins: 0, xp: 0, cardDrops: [] },
    };
  }

  // Win → award this round's bundle.
  const awarded = template.rewardsPerRound[match.round] ?? { coins: 0, xp: 0, cardDrops: [] };
  const newEarned = mergeBundles(run.earnedRewards, awarded);

  // Advance round if this was the last unplayed match in the round.
  const stillPending = newBracket.some(
    (m) => m.round === match.round && m.result === null,
  );
  const newRound = stillPending ? run.currentRound : run.currentRound + 1;
  const finishedTournament = newRound > template.rounds;

  return {
    run: {
      ...run,
      bracket: newBracket,
      currentRound: newRound,
      state: finishedTournament ? 'completed' : 'in-progress',
      earnedRewards: newEarned,
    },
    awarded,
  };
}

function buildBracket(template: TournamentTemplate, seed: number, playerLevel: number): TournamentMatch[] {
  const rng = createRng(seed);
  const matches: TournamentMatch[] = [];

  // Match count per round: 1, 1, 1... in this single-track player path.
  // The "bracket" the player walks through is a sequence (one fight per round),
  // which is the common mobile-friendly tournament UX. Visual brackets can
  // still be rendered around it.
  for (let round = 0; round <= template.rounds; round += 1) {
    const drift = template.difficultyCurve[round] ?? 0;
    const opponent = generateAIFighter({
      seed: Math.floor(rng() * 1e9) ^ (round * 31),
      league: template.league,
      effectiveLevel: playerLevel,
      difficultyDrift: drift,
    });
    matches.push({ round, index: 0, opponent, result: null });
  }
  return matches;
}

function mergeBundles(a: RewardBundle, b: RewardBundle): RewardBundle {
  return {
    coins: a.coins + b.coins,
    xp: a.xp + b.xp,
    cardDrops: [...a.cardDrops, ...b.cardDrops],
  };
}
