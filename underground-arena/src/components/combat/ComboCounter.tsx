import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { AppText } from '@/components/base';
import { theme } from '@/themes';
import { motion } from '@/themes/motion';
import { useReducedMotion } from '@/animations/hooks/useReducedMotion';

/**
 * Visible combo counter. Pops in with a bounce on each new combo step,
 * fades out when count drops to 0.
 *
 * Game-feel rationale:
 *  - Slight overshoot scale + color escalation per tier reinforces escalation.
 *  - Hidden entirely at count < 2 to keep HUD clean during single hits.
 */
export function ComboCounter({ count }: { count: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (count < 2) {
      if (reduced) {
        opacity.setValue(0);
        return;
      }
      Animated.timing(opacity, { toValue: 0, duration: motion.duration.fast, useNativeDriver: true }).start();
      return;
    }
    if (reduced) {
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }
    scale.setValue(0.7);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: motion.duration.fast, useNativeDriver: true }),
      Animated.timing(scale, {
        toValue: 1,
        duration: motion.duration.normal,
        easing: motion.easing.bounce,
        useNativeDriver: true,
      }),
    ]).start();
  }, [count, opacity, scale, reduced]);

  const tier = count >= 6 ? 'epic' : count >= 4 ? 'rare' : 'common';
  const tint =
    tier === 'epic' ? theme.colors.primaryGlow : tier === 'rare' ? theme.colors.orange : theme.colors.gold;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { opacity, transform: [{ scale }] }]}
    >
      <AppText size="caption" tone="muted" uppercase>
        Combo
      </AppText>
      <AppText size="title" weight="black" style={{ color: tint }}>
        {`× ${count}`}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
});
