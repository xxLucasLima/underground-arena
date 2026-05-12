import { create } from 'zustand';

type SettingsState = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  toggleSound: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  soundEnabled: true,
  hapticsEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}));
