import { runMatch, type CombatState } from '@/engine/combat';
import { MOCK_PLAYER } from '@/engine/combat/mockFighters';
import type { FighterProfile } from '@/engine/combat/types';
import { processFightResult, type PostFightSummary } from '@/services/progression/postFight';
import type { AIFighter } from '@/services/opponents';
import { createRng } from '@/engine/combat/rng';
import { rollProceduralEvent } from '@/services/modes/proceduralEvents';
import type { ProceduralEvent } from '@/data/modes/proceduralEvents';
import {
  bossMultiplier,
  composeMultipliers,
  dailyCompletionMultiplier,
  scaleBundle,
  survivalStreakMultiplier,
  tierMultiplier,
  tournamentRoundMultiplier,
} from '@/services/opponents/rewardScaling';
import type { RewardBundle } from '@/services/progression/types';

/**
 * Encounter-level orchestrator: a single, lightweight entry point used by
 * developer/debug screens to validate phase-05 systems end-to-end.
 *
 * Responsibilities:
 *  - Run a combat using the pure engine and a provided AIFighter.
 *  - Roll an (optional) procedural event from the seed and surface it to the UI.
 *  - Hand the final CombatState to the progression layer for XP/coins/achievements.
 *  - Compute a *scaled* reward preview based on encounter context (tier/boss/
 *    tournament round / survival streak / daily completion).
 *
 * Notes:
 *  - We DO NOT re-implement any combat or reward logic — we compose existing
 *    pure services. The scaled preview is informational; the canonical economy
 *    delta is what `processFightResult` produced.
 *  - Player fighter defaults to MOCK_PLAYER until a real player FighterProfile
 *    pipeline exists; callers can override.
 */
export type EncounterKind =
  | { kind: 'free' }
  | { kind: 'matchmaking' }
  | { kind: 'rival'; encounters: number }
  | { kind: 'boss'; bossId: string }
  | { kind: 'tournament'; round: number }
  | { kind: 'survival'; streak: number }
  | { kind: 'daily'; templateId: string };

export type EncounterFightResult = {
  state: CombatState;
  won: boolean;
  summary: PostFightSummary;
  event: ProceduralEvent | null;
  rewardPreview: {
    base: RewardBundle;
    scaled: RewardBundle;
    multiplier: number;
  };
};

export async function runEncounterFight(args: {
  opponent: AIFighter;
  seed: number;
  encounter: EncounterKind;
  player?: FighterProfile;
}): Promise<EncounterFightResult> {
  const player = args.player ?? MOCK_PLAYER;

  // Pure roll: same seed -> same event (good for replay/debug determinism).
  const event = rollProceduralEvent(createRng(args.seed ^ 0xa5a5));

  const state = runMatch({
    seed: args.seed,
    playerProfile: player,
    opponentProfile: args.opponent.profile,
  });
  const won = state.winnerId === player.id;

  const summary = await processFightResult({
    state,
    playerId: player.id,
    seed: args.seed,
  });

  // Compute a SCALED preview so dev screens can show what the *encounter-aware*
  // reward would have been if the reward pipeline consumed these multipliers.
  // (Progression service stays mode-agnostic by design.)
  const multiplier = composeMultipliers(
    tierMultiplier(args.opponent.meta.tier),
    args.encounter.kind === 'boss' ? bossMultiplier() : 1,
    args.encounter.kind === 'tournament' ? tournamentRoundMultiplier(args.encounter.round) : 1,
    args.encounter.kind === 'survival' ? survivalStreakMultiplier(args.encounter.streak) : 1,
    args.encounter.kind === 'daily' && won ? dailyCompletionMultiplier() : 1,
    event?.rewardMods?.coins ?? 1,
  );

  const rewardPreview = {
    base: summary.rewards,
    scaled: scaleBundle(summary.rewards, multiplier),
    multiplier,
  };

  return { state, won, summary, event, rewardPreview };
}
