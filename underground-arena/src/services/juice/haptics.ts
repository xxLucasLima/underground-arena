import { Platform, Vibration } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * Lightweight haptics shim.
 *
 * Why a shim instead of expo-haptics directly:
 *  - Audio is phase 07. We want a hookable abstraction now (so combat code
 *    already calls `haptics.impact('medium')`) without forcing a new dep.
 *  - Uses RN's bundled `Vibration` API as a baseline; swap to expo-haptics or
 *    react-native-haptic-feedback later by only editing this file.
 *  - Respects settingsStore.hapticsEnabled — never vibrates if user opted out.
 *  - Web/desktop platforms silently no-op.
 */
type Intensity = 'selection' | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const DURATIONS: Record<Intensity, number> = {
  selection: 8,
  light: 12,
  medium: 25,
  heavy: 45,
  success: 35,
  warning: 30,
  error: 60,
};

function enabled(): boolean {
  try {
    return useSettingsStore.getState().hapticsEnabled;
  } catch {
    return true;
  }
}

function vibrate(ms: number) {
  if (Platform.OS === 'web') return;
  try {
    Vibration.vibrate(ms);
  } catch {
    // ignore — vibrator may be unavailable on some emulators
  }
}

export const haptics = {
  impact(level: Exclude<Intensity, 'success' | 'warning' | 'error' | 'selection'> = 'medium') {
    if (!enabled()) return;
    vibrate(DURATIONS[level]);
  },
  selection() {
    if (!enabled()) return;
    vibrate(DURATIONS.selection);
  },
  notify(kind: 'success' | 'warning' | 'error' = 'success') {
    if (!enabled()) return;
    vibrate(DURATIONS[kind]);
  },
};
