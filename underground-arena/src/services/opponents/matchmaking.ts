import { OPPONENT_HISTORY_WINDOW } from '@/data/opponents/opponentConfig';
import { computeDifficultyDrift, generateAIFighter } from './fighterGenerator';
import { getBossesForLeague, type BossDefinition } from '@/data/opponents/bosses';
import type { AIFighter, MatchmakingContext, OpponentHistoryEntry } from './types';

/**
 * Matchmaking is a pure function pipeline:
 *
 *   pickOpponent(ctx, seedBase, options) →
 *     1. derive difficultyDrift from recentResults
 *     2. derive a candidate seed list (seedBase, seedBase+1, ...)
 *     3. for each candidate, generate the fighter and reject if it duplicates
 *        an archetype seen in `history[0..OPPONENT_HISTORY_WINDOW]`.
 *     4. fall back to the first candidate if all are rejected.
 *
 * No stores, no I/O. Callers feed it data; UI/store layer persists it.
 */
export function pickOpponent(
  ctx: MatchmakingContext,
  seedBase: number,
  options?: { archetypeId?: string; maxAttempts?: number },
): AIFighter {
  const drift = computeDifficultyDrift(ctx);
  const recent = ctx.history.slice(-OPPONENT_HISTORY_WINDOW);
  const maxAttempts = options?.maxAttempts ?? 6;

  let chosen: AIFighter | null = null;
  for (let i = 0; i < maxAttempts; i += 1) {
    const candidate = generateAIFighter({
      seed: seedBase + i * 97,
      league: ctx.league,
      archetypeId: options?.archetypeId,
      effectiveLevel: ctx.playerLevel,
      difficultyDrift: drift,
    });
    const archetypeDup = recent.some((r) => r.archetypeId === candidate.meta.archetypeId);
    const seedDup = recent.some((r) => r.seed === candidate.meta.seed);
    if (!archetypeDup && !seedDup) {
      chosen = candidate;
      break;
    }
    if (!chosen) chosen = candidate; // remember a fallback
  }
  return chosen!;
}

/** Generate a boss fighter from its BossDefinition + context (deterministic). */
export function generateBossFighter(boss: BossDefinition, ctx: { playerLevel: number }): AIFighter {
  return generateAIFighter({
    seed: boss.seed,
    league: boss.league,
    archetypeId: boss.archetypeId,
    tier: boss.tier,
    effectiveLevel: Math.max(ctx.playerLevel, 1),
    boss,
  });
}

/** Returns bosses currently unlocked for the player. */
export function getUnlockedBosses(args: { league: string; totalFights: number }): BossDefinition[] {
  return getBossesForLeague(args.league as BossDefinition['league'])
    .filter((b) => args.totalFights >= b.unlockAfterFights);
}

/** Push a new history entry while keeping the window size bounded. */
export function appendHistory(
  history: OpponentHistoryEntry[],
  entry: OpponentHistoryEntry,
): OpponentHistoryEntry[] {
  const next = [...history, entry];
  if (next.length <= OPPONENT_HISTORY_WINDOW) return next;
  return next.slice(next.length - OPPONENT_HISTORY_WINDOW);
}
