import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/base';
import { theme } from '@/themes';
import { motion } from '@/themes/motion';
import { useReducedMotion } from '@/animations/hooks/useReducedMotion';

export type KOOverlayProps = {
  visible: boolean;
  outcome: 'KO' | 'Submission' | 'Defeat' | 'Draw';
  onDone?: () => void;
};

/**
 * Dramatic finish overlay. Heavy backdrop fade, scaled+bouncy title, holds
 * for a moment then invokes onDone. The Fight screen pairs this with a
 * short "hit pause" (slowed advance loop) for the slow-motion effect.
 *
 * Performance: native-driven scale/opacity; one-shot per match.
 */
export function KOOverlay({ visible, outcome, onDone }: KOOverlayProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1.6)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      return;
    }
    if (reduced) {
      opacity.setValue(1);
      scale.setValue(1);
      const t = setTimeout(() => onDone?.(), 600);
      return () => clearTimeout(t);
    }
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: motion.duration.fast, useNativeDriver: true }),
        Animated.timing(scale, {
          toValue: 1,
          duration: motion.duration.hero,
          easing: motion.easing.bounce,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(motion.duration.ko),
    ]).start(() => onDone?.());
  }, [visible, opacity, scale, reduced, onDone]);

  if (!visible) return null;

  const isVictory = outcome === 'KO' || outcome === 'Submission';
  const tint = isVictory ? theme.colors.gold : outcome === 'Draw' ? theme.colors.silver : theme.colors.primaryGlow;

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, { opacity }]}>
      <View style={styles.dim} />
      <Animated.View style={[styles.titleWrap, { transform: [{ scale }] }]}>
        <AppText size="display" weight="black" uppercase style={[styles.title, { color: tint }]}>
          {outcome === 'KO' ? '★ K.O. ★' : outcome === 'Submission' ? 'TAP OUT' : outcome === 'Draw' ? 'Draw' : 'Defeat'}
        </AppText>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  titleWrap: { paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.lg },
  title: { textAlign: 'center', textShadowColor: '#000', textShadowRadius: 8, textShadowOffset: { width: 0, height: 4 } },
});
