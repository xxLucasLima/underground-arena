import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/base';
import { theme } from '@/themes';
import { motion } from '@/themes/motion';
import { useReducedMotion } from '@/animations/hooks/useReducedMotion';

export type RewardPopupProps = {
  glyph: string;
  label: string;
  value: string;
  tint?: string;
  delay?: number;
};

/**
 * A reward "ticker line": glyph + label + value, animated in with a stagger.
 *
 * Composition pattern: the Rewards screen renders multiple RewardPopups with
 * increasing `delay` to produce a satisfying cascade (coin → xp → drops).
 * Decoupling lets each line live where it belongs visually.
 */
export function RewardPopup({ glyph, label, value, tint = theme.colors.gold, delay = 0 }: RewardPopupProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const tx = useRef(new Animated.Value(-24)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      tx.setValue(0);
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
      Animated.timing(tx, {
        toValue: 0,
        delay,
        duration: motion.duration.normal,
        easing: motion.easing.bounce,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, tx, reduced]);

  return (
    <Animated.View style={[styles.row, { opacity, transform: [{ translateX: tx }], borderColor: tint }]}>
      <AppText size="title">{glyph}</AppText>
      <View style={{ flex: 1 }}>
        <AppText size="caption" tone="muted" uppercase>
          {label}
        </AppText>
        <AppText size="subtitle" weight="bold" style={{ color: tint }}>
          {value}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    backgroundColor: theme.colors.surfaceElevated,
  },
});
