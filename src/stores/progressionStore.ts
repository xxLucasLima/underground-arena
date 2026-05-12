import { create } from 'zustand';

type ProgressionState = {
  xp: number;
  league: string;
};

export const useProgressionStore = create<ProgressionState>(() => ({
  xp: 0,
  league: 'Underground Amateur',
}));
