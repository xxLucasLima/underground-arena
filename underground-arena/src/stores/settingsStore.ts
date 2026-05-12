import { create } from 'zustand';
import { getObject, setObject } from '@/services/persistence/storage';
import { storageKeys } from '@/services/persistence/keys';

type SettingsSnapshot = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  /** Master switch for visual juice (screen shake, flashes). a11y/perf escape hatch. */
  visualEffectsEnabled: boolean;
};

type SettingsState = SettingsSnapshot & {
  hydrate: () => Promise<void>;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleReducedMotion: () => void;
  toggleVisualEffects: () => void;
};

const initial: SettingsSnapshot = {
  soundEnabled: true,
  hapticsEnabled: true,
  reducedMotion: false,
  visualEffectsEnabled: true,
};

function persist(state: SettingsSnapshot) {
  return setObject(storageKeys.settings, state);
}

function snapshotOf(s: SettingsState): SettingsSnapshot {
  return {
    soundEnabled: s.soundEnabled,
    hapticsEnabled: s.hapticsEnabled,
    reducedMotion: s.reducedMotion,
    visualEffectsEnabled: s.visualEffectsEnabled,
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...initial,
  hydrate: async () => {
    const persisted = await getObject<SettingsSnapshot>(storageKeys.settings);
    if (persisted) set(persisted);
  },
  toggleSound: () => {
    set({ soundEnabled: !get().soundEnabled });
    void persist(snapshotOf(get()));
  },
  toggleHaptics: () => {
    set({ hapticsEnabled: !get().hapticsEnabled });
    void persist(snapshotOf(get()));
  },
  toggleReducedMotion: () => {
    set({ reducedMotion: !get().reducedMotion });
    void persist(snapshotOf(get()));
  },
  toggleVisualEffects: () => {
    set({ visualEffectsEnabled: !get().visualEffectsEnabled });
    void persist(snapshotOf(get()));
  },
}));
