import { forwardRef, useImperativeHandle } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useFlash } from '@/animations/hooks/useFlash';
import { useSettingsStore } from '@/stores/settingsStore';

export type HitFlashHandle = { flash: (intensity?: 'light' | 'medium' | 'heavy' | 'critical') => void };

const PEAK: Record<NonNullable<Parameters<HitFlashHandle['flash']>[0]>, number> = {
  light: 0.18,
  medium: 0.35,
  heavy: 0.55,
  critical: 0.8,
};

/**
 * Full-screen red flash overlay. Forward-ref so the Fight screen can imperatively
 * `flash('heavy')` from a feedback listener without re-rendering.
 *
 * Performance: native driver on opacity; the underlying View is absolute and
 * pointer-events: none so it never costs a layout pass.
 */
export const HitFlash = forwardRef<HitFlashHandle, { color?: string }>(({ color = '#FF2D45' }, ref) => {
  const { opacity, trigger } = useFlash();
  const fxEnabled = useSettingsStore((s) => s.visualEffectsEnabled);

  useImperativeHandle(ref, () => ({
    flash: (intensity = 'medium') => {
      if (!fxEnabled) return;
      trigger(PEAK[intensity]);
    },
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.layer, { backgroundColor: color, opacity }]}
    />
  );
});
HitFlash.displayName = 'HitFlash';

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
