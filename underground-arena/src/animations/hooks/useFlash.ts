import { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { motion } from '@/themes/motion';
import { useReducedMotion } from './useReducedMotion';

/**
 * Flash primitive — drives an opacity 0 → peak → 0 burst. Used for hit
 * impact overlays, KO flashes, level-up bursts.
 *
 * Game-feel rationale: very short ramp-up (40ms) + slightly longer fade-out
 * (160ms) reads as a snapped flash rather than a fade.
 *
 * Unmount-safety: the in-flight animation is stopped when the component
 * unmounts. Otherwise the native side can deliver a final frame to a freed
 * view and crash with "ReadableNativeMap cannot be cast to Double" on Android.
 */
export function useFlash() {
  const opacity = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  const current = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      current.current?.stop();
      current.current = null;
      opacity.stopAnimation();
    };
  }, [opacity]);

  const trigger = useCallback(
    (peak = 0.6) => {
      current.current?.stop();
      if (reduced) {
        const anim = Animated.sequence([
          Animated.timing(opacity, {
            toValue: peak * 0.4,
            duration: motion.duration.micro,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: motion.duration.fast,
            useNativeDriver: true,
          }),
        ]);
        current.current = anim;
        anim.start();
        return;
      }
      const anim = Animated.sequence([
        Animated.timing(opacity, {
          toValue: peak,
          duration: 40,
          easing: motion.easing.impact,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: motion.duration.fast,
          easing: motion.easing.out,
          useNativeDriver: true,
        }),
      ]);
      current.current = anim;
      anim.start();
    },
    [reduced, opacity],
  );

  return { opacity, trigger };
}
