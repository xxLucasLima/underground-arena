import { create } from 'zustand';

type CombatState = {
  inCombat: boolean;
  round: number;
};

export const useCombatStore = create<CombatState>(() => ({
  inCombat: false,
  round: 0,
}));
