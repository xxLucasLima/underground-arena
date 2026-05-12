import { useSettingsStore } from '@/stores/settingsStore';

/**
 * Audio hook stub.
 *
 * Phase 07 will wire a real audio system. For now we expose the *interface*
 * so feedback consumers can call `audio.play('hit-medium')` today. When the
 * real implementation lands, only this file changes.
 *
 * Decoupling rationale: UI never imports an audio library directly. It calls
 * `audio.play(SoundId)` and respects settings.soundEnabled. This keeps the UI
 * + feedback layers portable across audio backends (expo-av, react-native-sound).
 */
export type SoundId =
  | 'hit-light'
  | 'hit-medium'
  | 'hit-heavy'
  | 'critical'
  | 'combo'
  | 'counter'
  | 'ko'
  | 'submission'
  | 'menu-click'
  | 'reward'
  | 'level-up'
  | 'pack-open'
  | 'card-reveal-common'
  | 'card-reveal-rare'
  | 'card-reveal-epic'
  | 'card-reveal-legendary';

function enabled(): boolean {
  try {
    return useSettingsStore.getState().soundEnabled;
  } catch {
    return true;
  }
}

export const audio = {
  play(_id: SoundId) {
    if (!enabled()) return;
    // No-op stub. Phase 07 will replace this.
  },
  preload(_ids: SoundId[]) {
    // No-op stub.
  },
};
