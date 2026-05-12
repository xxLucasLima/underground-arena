import { create } from 'zustand';

type EnergyState = {
  current: number;
  max: number;
};

export const useEnergyStore = create<EnergyState>(() => ({
  current: 10,
  max: 10,
}));
