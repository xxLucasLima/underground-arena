import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { motion } from '@/themes/motion';
import { useReducedMotion } from './useReducedMotion';

/**
 * Micro-interaction primitive: scale a Pressable down on press-in, bounce back
 * on press-out. Returns the animated value + handlers — caller owns layout.
 *
 * Game-feel rationale: a 95% press scale + bounce-out gives the universal
 * "tactile button" feel without blocking taps or causing re-renders.
 */
export function usePressScale(min = 0.95) {
  const value = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();

  const onPressIn = useCallback(() => {
    if (reduced) return;
    Animated.timing(value, {
      toValue: min,
      duration: motion.duration.micro,
      easing: motion.easing.standard,
      useNativeDriver: true,
    }).start();
  }, [min, reduced, value]);

  const onPressOut = useCallback(() => {
    if (reduced) return;
    Animated.timing(value, {
      toValue: 1,
      duration: motion.duration.fast,
      easing: motion.easing.bounce,
      useNativeDriver: true,
    }).start();
  }, [reduced, value]);

  return { scale: value, onPressIn, onPressOut };
}
