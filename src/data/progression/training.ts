import type { FighterStats } from '@/engine/combat/types';

export type TrainingProgramId =
  | 'strength_basic'
  | 'speed_basic'
  | 'cardio_basic'
  | 'technique_basic'
  | 'defense_basic';

export type TrainingProgram = {
  id: TrainingProgramId;
  name: string;
  stat: keyof FighterStats;
  durationSeconds: number;
  energyCost: number;
  statGain: number;
  coinCost: number;
  unlockLevel: number;
};

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  { id: 'strength_basic',  name: 'Heavy Bag',     stat: 'strength',  durationSeconds: 5 * 60,  energyCost: 3, statGain: 1, coinCost: 50,  unlockLevel: 1 },
  { id: 'speed_basic',     name: 'Footwork',      stat: 'speed',     durationSeconds: 5 * 60,  energyCost: 3, statGain: 1, coinCost: 50,  unlockLevel: 1 },
  { id: 'cardio_basic',    name: 'Roadwork',      stat: 'cardio',    durationSeconds: 6 * 60,  energyCost: 3, statGain: 1, coinCost: 50,  unlockLevel: 1 },
  { id: 'technique_basic', name: 'Pad Work',      stat: 'technique', durationSeconds: 6 * 60,  energyCost: 3, statGain: 1, coinCost: 60,  unlockLevel: 2 },
  { id: 'defense_basic',   name: 'Slip & Block',  stat: 'defense',   durationSeconds: 6 * 60,  energyCost: 3, statGain: 1, coinCost: 60,  unlockLevel: 3 },
];
