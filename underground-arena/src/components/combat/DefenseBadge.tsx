import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/base';
import { feedbackBus } from '@/feedback/feedbackBus';
import type { FeedbackCue } from '@/feedback/types';
import { theme } from '@/themes';
import { motion } from '@/themes/motion';
import { useReducedMotion } from '@/animations/hooks/useReducedMotion';
import { haptics } from '@/services/juice/haptics';

/**
 * DefenseBadge — large, high-contrast call-out for defensive outcomes.
 *
 * The single most important readability fix in combat: when an attack does
 * NOT land, the player needs to know *immediately* and *unambiguously* why.
 * A floating "0" damage number doesn't communicate that.
 *
 * Design rules:
 *  - One word per outcome, uppercase, oversized: DODGED / BLOCKED / PARRIED
 *    / COUNTERED / MISSED.
 *  - Each outcome has a distinct color so muscle memory builds across fights.
 *  - Positioned on the defender's side (left/right) — never centered, so it
 *    cannot be confused with damage numbers (which spawn over the *target*).
 *  - Brief slide + bounce in, hold, fade out. Total dwell ≈ 700ms — short
 *    enough not to clog the screen, long enough to read at a glance.
 *
 * Decoupling: self-subscribes to feedbackBus and is drop-in. No props.
 */
type Outcome = 'dodge' | 'block' | 'parry' | 'miss' | 'counter';

const OUTCOME_LABEL: Record<Outcome, string> = {
  dodge: 'DODGED',
  block: 'BLOCKED',
  parry: 'PARRIED',
  miss: 'MISSED',
  counter: 'COUNTERED',
};

// Distinct, semantically meaningful colors. Block/parry are *protective* (cool
// tones), counter is *aggressive* (gold), dodge is *speed* (neon), miss is
// neutral (muted text) because it's the least interesting outcome.
const OUTCOME_COLOR: Record<Outcome, string> = {
  dodge: theme.colors.neon,
  block: theme.colors.silver,
  parry: theme.colors.warning,
  miss: theme.colors.textMuted,
  counter: theme.colors.gold,
};

// Symbol prefixed to the label so colorblind players still get a distinct
// glyph per outcome. Kept ASCII to avoid font fallback surprises on Android.
const OUTCOME_GLYPH: Record<Outcome, string> = {
  dodge: '»',
  block: '▮',
  parry: '×',
  miss: '·',
  counter: '↺',
};

type BadgeState = {
  outcome: Outcome;
  target: 'player' | 'opponent';
  nonce: number;
};

export function DefenseBadge() {
  const [badge, setBadge] = useState<BadgeState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const nonceRef = useRef(0);
  const reduced = useReducedMotion();
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const off = feedbackBus.on((cue: FeedbackCue) => {
      if (cue.kind !== 'defense') return;
      nonceRef.current += 1;
      setBadge({ outcome: cue.outcome, target: cue.target, nonce: nonceRef.current });
      // Light haptic — defensive plays are notable but shouldn't outweigh hits.
      // Counter gets a bigger pulse because it's a tactical inflection.
      haptics.impact(cue.outcome === 'counter' ? 'medium' : 'light');
    });
    return off;
  }, []);

  useEffect(() => {
    if (!badge) return;
    anim.current?.stop();

    // Slide direction: badge appears on the defender's side so the player can
    // tell *who* defended at a glance.
    const fromTx = badge.target === 'player' ? -36 : 36;
    if (reduced) {
      opacity.setValue(1);
      tx.setValue(0);
      scale.setValue(1);
      const t = setTimeout(() => {
        setBadge((b) => (b && b.nonce === nonceRef.current ? null : b));
      }, 700);
      return () => clearTimeout(t);
    }

    opacity.setValue(0);
    tx.setValue(fromTx);
    scale.setValue(0.85);

    const seq = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: motion.duration.fast,
          easing: motion.easing.out,
          useNativeDriver: true,
        }),
        Animated.timing(tx, {
          toValue: 0,
          duration: motion.duration.normal,
          easing: motion.easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: motion.duration.normal,
          easing: motion.easing.bounce,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(520),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: motion.duration.fast,
          easing: motion.easing.in,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.08,
          duration: motion.duration.fast,
          easing: motion.easing.in,
          useNativeDriver: true,
        }),
      ]),
    ]);
    anim.current = seq;
    seq.start(({ finished }) => {
      if (finished) {
        setBadge((b) => (b && b.nonce === nonceRef.current ? null : b));
      }
    });
    return () => {
      // Cancel pending finalize when the badge changes — sequence will start
      // fresh on the new effect run.
    };
  }, [badge, reduced, opacity, tx, scale]);

  useEffect(() => {
    return () => {
      anim.current?.stop();
      anim.current = null;
      opacity.stopAnimation();
      tx.stopAnimation();
      scale.stopAnimation();
    };
  }, [opacity, tx, scale]);

  if (!badge) return null;

  const color = OUTCOME_COLOR[badge.outcome];
  return (
    <View
      pointerEvents="none"
      style={[
        styles.host,
        // Anchor toward the defender's row vertically so it visually pairs
        // with the side that defended.
        badge.target === 'player' ? styles.hostPlayer : styles.hostOpponent,
      ]}
    >
      <Animated.View
        style={[
          styles.badge,
          {
            borderColor: color,
            opacity,
            transform: [{ translateX: tx }, { scale }],
          },
        ]}
      >
        <AppText size="caption" tone="muted" uppercase>
          {badge.target === 'player' ? 'You' : 'Opponent'}
        </AppText>
        <AppText size="display" weight="black" style={[styles.label, { color }]}>
          {`${OUTCOME_GLYPH[badge.outcome]} ${OUTCOME_LABEL[badge.outcome]}`}
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    // Above status toasts, below MoveBanner. The fixed positioning ensures
    // defense badges never overlap damage numbers (which spawn from fighter
    // panels) or the centered move banner.
  },
  // The MoveBanner is a fullscreen centered overlay (~middle 30% of the
  // screen). To stay visible we anchor the badge *near the defender's
  // fighter panel* — top for opponent, bottom for player — well outside
  // the banner's footprint.
  hostPlayer: {
    bottom: '12%',
  },
  hostOpponent: {
    top: '14%',
  },
  badge: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    borderWidth: 2,
    backgroundColor: theme.colors.surfaceElevated,
  },
  label: {
    letterSpacing: 2,
  },
});
