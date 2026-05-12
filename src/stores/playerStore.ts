import { create } from 'zustand';

type PlayerState = {
  name: string;
  level: number;
  setName: (name: string) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  name: 'Rookie',
  level: 1,
  setName: (name) => set({ name }),
}));
