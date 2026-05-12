import { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { motion } from '@/themes/motion';
import { useReducedMotion } from './useReducedMotion';

/**
 * Screen / element shake primitive. Returns an animated `translateX` value and
 * a `trigger(intensity)` imperative function.
 *
 * Game-feel rationale: 4 short alternating offsets feels punchy without
 * making the UI hard to read. Intensity scales linearly with hit weight.
 *
 * Performance: uses native driver. Cancels any existing shake before starting
 * a new one so chained hits don't visually stack into chaos.
 */
export function useShake() {
  const tx = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  const seq = useRef<Animated.CompositeAnimation | null>(null);

  // Stop any in-flight animation when the host unmounts. Without this, the
  // native animation can deliver a final frame to a freed view and crash
  // Android RN with "ReadableNativeMap cannot be cast to Double".
  useEffect(() => {
    return () => {
      seq.current?.stop();
      seq.current = null;
      tx.stopAnimation();
    };
  }, [tx]);

  const trigger = useCallback(
    (intensity: number = motion.shake.medium) => {
      if (reduced) return;
      seq.current?.stop();
      const step = (to: number, d: number) =>
        Animated.timing(tx, {
          toValue: to,
          duration: d,
          easing: motion.easing.impact,
          useNativeDriver: true,
        });
      const i = Math.max(1, intensity);
      const anim = Animated.sequence([
        step(i, 40),
        step(-i, 60),
        step(i * 0.6, 50),
        step(-i * 0.4, 50),
        step(0, 60),
      ]);
      seq.current = anim;
      anim.start();
    },
    [reduced, tx],
  );

  return { translateX: tx, trigger };
}
