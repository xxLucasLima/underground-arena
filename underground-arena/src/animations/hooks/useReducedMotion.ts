import { useSettingsStore } from '@/stores/settingsStore';

/**
 * Single point of truth for "should I animate?". Reads from settingsStore.
 * Wrapping in a hook lets us later add OS-level reduce-motion detection
 * (AccessibilityInfo) without touching call sites.
 */
export function useReducedMotion(): boolean {
  return useSettingsStore((s) => s.reducedMotion);
}
