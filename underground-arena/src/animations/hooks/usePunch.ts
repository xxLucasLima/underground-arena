import { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { motion } from '@/themes/motion';
import { useReducedMotion } from './useReducedMotion';

/**
 * "Punch" scale primitive: a quick scale-up then a bouncy settle. Pair with
 * useShake / useFlash to compose a hit reaction.
 */
export function usePunch() {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const current = useRef<Animated.CompositeAnimation | null>(null);

  // Stop on unmount: prevents native frames being delivered to a freed view
  // after navigation away (manifests as opacity/transform cast errors).
  useEffect(() => {
    return () => {
      current.current?.stop();
      current.current = null;
      scale.stopAnimation();
    };
  }, [scale]);

  const trigger = useCallback(
    (peak: number = motion.punchScale.medium) => {
      if (reduced) return;
      current.current?.stop();
      const anim = Animated.sequence([
        Animated.timing(scale, {
          toValue: peak,
          duration: 70,
          easing: motion.easing.impact,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: motion.duration.normal,
          easing: motion.easing.bounce,
          useNativeDriver: true,
        }),
      ]);
      current.current = anim;
      anim.start();
    },
    [reduced, scale],
  );

  return { scale, trigger };
}
