import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AppCard, AppText } from '@/components/base';
import { rarityColors } from '@/themes/colors';
import { theme } from '@/themes';
import { motion } from '@/themes/motion';
import { useReducedMotion } from '@/animations/hooks/useReducedMotion';
import type { CardDefinition } from '@/types/cards';
import { haptics } from '@/services/juice/haptics';
import { audio } from '@/services/juice/audio';
import type { SoundId } from '@/services/juice/audio';

type RarityRevealProps = {
  card: CardDefinition;
  /** When true, plays the reveal sequence. */
  visible: boolean;
  delay?: number;
};

const RARITY_SOUND: Record<CardDefinition['rarity'], SoundId> = {
  Common: 'card-reveal-common',
  Rare: 'card-reveal-rare',
  Epic: 'card-reveal-epic',
  Legendary: 'card-reveal-legendary',
};

/**
 * Reward-style card reveal. Pulses with the rarity color, with intensity and
 * delay tuned per rarity. Used in PackOpening and post-fight drop displays.
 *
 * Game-feel rationale:
 *  - Higher rarities get bigger overshoot + heavier haptic + longer dwell so
 *    legendaries actually feel like a moment.
 */
export function RarityReveal({ card, visible, delay = 0 }: RarityRevealProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      return;
    }
    const t = setTimeout(() => {
      const intensity =
        card.rarity === 'Legendary' ? 'heavy' : card.rarity === 'Epic' ? 'medium' : 'light';
      haptics.impact(intensity);
      audio.play(RARITY_SOUND[card.rarity]);
    }, delay);

    if (reduced) {
      opacity.setValue(1);
      scale.setValue(1);
      glow.setValue(1);
      return () => clearTimeout(t);
    }

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: motion.duration.fast, useNativeDriver: true }),
        Animated.timing(scale, {
          toValue: 1,
          duration: card.rarity === 'Legendary' ? motion.duration.hero : motion.duration.normal,
          easing: motion.easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 1,
          duration: motion.duration.slow,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    return () => clearTimeout(t);
  }, [visible, card.rarity, delay, opacity, scale, glow, reduced]);

  if (!visible) return null;

  const tint = rarityColors[card.rarity];

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      {/*
        IMPORTANT: this layer hosts an animated `opacity` interpolation, so it
        MUST be an Animated.View. Putting an interpolation on a plain `View`
        crashes Android with "ReadableNativeMap cannot be cast to Double"
        because RN tries to coerce the animated node descriptor to a primitive.
      */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            backgroundColor: tint,
            opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }),
          },
        ]}
      />
      <AppCard variant="highlight" style={{ borderColor: tint }}>
        <AppText size="caption" tone="muted" uppercase>
          {card.rarity}
        </AppText>
        <AppText size="title" weight="black" style={{ color: tint }}>
          {card.icon} {card.name}
        </AppText>
        <AppText size="caption" tone="muted">
          {card.description}
        </AppText>
      </AppCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: theme.radii.lg + 8,
  },
});
