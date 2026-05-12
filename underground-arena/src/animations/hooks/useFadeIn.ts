import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { motion } from '@/themes/motion';
import { useReducedMotion } from './useReducedMotion';

/**
 * Mount-time fade-in (+ small slide-up). Used by panels / screens.
 */
export function useFadeIn(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(8)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      ty.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        delay,
        duration: motion.duration.normal,
        easing: motion.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(ty, {
        toValue: 0,
        delay,
        duration: motion.duration.normal,
        easing: motion.easing.out,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, ty, reduced]);

  return { opacity, translateY: ty };
}
