import { TRAINING_PROGRAMS, type TrainingProgram, type TrainingProgramId } from '@/data/progression/training';
import type { FighterStats } from '@/engine/combat/types';
import type { TrainingSession } from './types';

export function getProgram(id: TrainingProgramId): TrainingProgram | undefined {
  return TRAINING_PROGRAMS.find((p) => p.id === id);
}

export function listAvailablePrograms(playerLevel: number): TrainingProgram[] {
  return TRAINING_PROGRAMS.filter((p) => p.unlockLevel <= playerLevel);
}

export function startTraining(programId: TrainingProgramId, now = Date.now()): TrainingSession | null {
  const program = getProgram(programId);
  if (!program) return null;
  return { id: program.id, startedAt: now, endsAt: now + program.durationSeconds * 1000 };
}

export function isTrainingComplete(session: TrainingSession | null, now = Date.now()): boolean {
  if (!session) return false;
  return now >= session.endsAt;
}

export function applyTrainingResult(stats: FighterStats, programId: TrainingProgramId): FighterStats {
  const program = getProgram(programId);
  if (!program) return stats;
  return { ...stats, [program.stat]: stats[program.stat] + program.statGain };
}
