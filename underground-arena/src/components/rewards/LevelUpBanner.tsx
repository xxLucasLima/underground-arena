import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { AppCard, AppText } from '@/components/base';
import { theme } from '@/themes';
import { motion } from '@/themes/motion';
import { useReducedMotion } from '@/animations/hooks/useReducedMotion';
import { haptics } from '@/services/juice/haptics';
import { audio } from '@/services/juice/audio';

type Props = {
  visible: boolean;
  fromLevel: number;
  toLevel: number;
};

/**
 * Dramatic level-up banner. Composes a glowing AppCard with a bouncy entrance
 * + haptic + sound on visible-edge.
 *
 * Mounted unconditionally and toggled by `visible` so the animation can replay
 * if used multiple times (e.g. multi-level bumps).
 */
export function LevelUpBanner({ visible, fromLevel, toLevel }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      return;
    }
    haptics.notify('success');
    audio.play('level-up');
    if (reduced) {
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: motion.duration.fast, useNativeDriver: true }),
      Animated.timing(scale, {
        toValue: 1,
        duration: motion.duration.hero,
        easing: motion.easing.bounce,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacity, scale, reduced]);

  if (!visible) return null;

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <AppCard variant="highlight" padding="lg">
        <AppText size="caption" tone="muted" uppercase>
          Level Up
        </AppText>
        <AppText size="display" weight="black" style={styles.title}>
          {`${fromLevel} → ${toLevel}`}
        </AppText>
        <AppText size="caption" tone="muted">
          New cards may be unlocked. Check your collection.
        </AppText>
      </AppCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.gold,
    textShadowColor: '#000',
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 3 },
  },
});
