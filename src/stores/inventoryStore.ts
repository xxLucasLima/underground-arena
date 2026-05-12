import { create } from 'zustand';

type InventoryState = {
  coins: number;
  gems: number;
};

export const useInventoryStore = create<InventoryState>(() => ({
  coins: 0,
  gems: 0,
}));
