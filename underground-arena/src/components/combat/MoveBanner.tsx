import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/base';
import { feedbackBus } from '@/feedback/feedbackBus';
import type { FeedbackCue } from '@/feedback/types';
import { rarityColors } from '@/themes/colors';
import { theme } from '@/themes';
import { motion } from '@/themes/motion';
import { useReducedMotion } from '@/animations/hooks/useReducedMotion';
import { haptics } from '@/services/juice/haptics';
import { audio } from '@/services/juice/audio';
import type { CardRarity } from '@/types/cards';

/**
 * MoveBanner — the combat presentation layer's headline element.
 *
 * Responsibilities (and explicitly *only* these):
 *  - Subscribe to the feedbackBus for `move` cues.
 *  - Render the most recent move as a transient rarity-styled banner.
 *  - Scale entrance/exit visuals + haptics with rarity tier:
 *      Common    → minimal slide-in, no haptic, no flash
 *      Rare      → small bounce + light haptic
 *      Epic      → bigger bounce + medium haptic + soft glow flash
 *      Legendary → cinematic scale-in, heavy haptic, full screen tint flash
 *
 * Decoupling:
 *  - Knows nothing about the engine, cards data, or combat state.
 *  - Self-subscribes — drops into any screen that's part of a fight context.
 *  - Communicates with the rest of the world only through feedbackBus +
 *    sibling juice services (haptics/audio).
 *
 * Performance: opacity / transform / glow are all native-driver animated.
 * The component re-renders only when a new move arrives (one setState per
 * card played — at most a few times per second), never per-frame.
 */

type BannerState = {
  cardId: string;
  name: string;
  icon: string;
  rarity: CardRarity;
  category: string;
  target: 'player' | 'opponent';
  /** Bump counter so identical consecutive moves still retrigger animation. */
  nonce: number;
};

// Banner dwell tuned to *match* the playback dwell on `cardPlayed` so the
// banner is visible until the resulting damage/defense event begins. Anything
// shorter and the player loses the cause→effect link.
const RARITY_DWELL_MS: Record<CardRarity, number> = {
  Common: 800,
  Rare: 1000,
  Epic: 1300,
  Legendary: 1800,
};

const RARITY_SCALE_FROM: Record<CardRarity, number> = {
  Common: 0.96,
  Rare: 0.9,
  Epic: 0.82,
  Legendary: 0.7,
};

export function MoveBanner() {
  const [banner, setBanner] = useState<BannerState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nonceRef = useRef(0);
  const inFlight = useRef<Animated.CompositeAnimation | null>(null);

  // Subscribe once. Imperative refs/state below; the bus listener is the only
  // entry point so the component stays trivially testable.
  useEffect(() => {
    const off = feedbackBus.on((cue: FeedbackCue) => {
      if (cue.kind !== 'move') return;
      nonceRef.current += 1;
      setBanner({
        cardId: cue.cardId,
        name: cue.name,
        icon: cue.icon,
        rarity: cue.rarity,
        category: cue.category,
        target: cue.target,
        nonce: nonceRef.current,
      });
    });
    return off;
  }, []);

  // Drive the animation in response to banner changes. Kept separate from the
  // subscription so animation logic is easy to reason about / reduced-motion
  // path is straightforward.
  useEffect(() => {
    if (!banner) return;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    inFlight.current?.stop();

    // Side-effects keyed by rarity. Audio cue + haptic intensity escalate
    // alongside the visual scale so the *feel* matches the look.
    if (banner.rarity === 'Legendary') {
      haptics.impact('heavy');
      audio.play('critical');
    } else if (banner.rarity === 'Epic') {
      haptics.impact('medium');
    } else if (banner.rarity === 'Rare') {
      haptics.impact('light');
    }

    const dwell = RARITY_DWELL_MS[banner.rarity];
    const fromScale = RARITY_SCALE_FROM[banner.rarity];
    const fromTx = banner.target === 'player' ? 24 : -24;

    if (reduced) {
      opacity.setValue(1);
      scale.setValue(1);
      tx.setValue(0);
      glow.setValue(banner.rarity === 'Legendary' ? 1 : 0);
      hideTimer.current = setTimeout(() => setBanner(null), dwell);
      return;
    }

    opacity.setValue(0);
    scale.setValue(fromScale);
    tx.setValue(fromTx);
    glow.setValue(0);

    const entrance = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.fast,
        easing: motion.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration:
          banner.rarity === 'Legendary' ? motion.duration.hero : motion.duration.normal,
        easing: motion.easing.bounce,
        useNativeDriver: true,
      }),
      Animated.timing(tx, {
        toValue: 0,
        duration: motion.duration.normal,
        easing: motion.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: 1,
        duration: motion.duration.slow,
        easing: motion.easing.out,
        useNativeDriver: true,
      }),
    ]);

    const exit = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: motion.duration.fast,
        easing: motion.easing.in,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.04,
        duration: motion.duration.fast,
        easing: motion.easing.in,
        useNativeDriver: true,
      }),
    ]);

    const seq = Animated.sequence([entrance, Animated.delay(dwell), exit]);
    inFlight.current = seq;
    seq.start(({ finished }) => {
      // Only clear if this run wasn't superseded by a newer banner.
      if (finished) setBanner((b) => (b && b.nonce === nonceRef.current ? null : b));
    });

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [banner, reduced, opacity, scale, tx, glow]);

  // Stop on unmount — same reason as the other animation hooks: animated frames
  // delivered to a freed view crash Android with the ReadableNativeMap cast.
  useEffect(() => {
    return () => {
      inFlight.current?.stop();
      inFlight.current = null;
      opacity.stopAnimation();
      scale.stopAnimation();
      tx.stopAnimation();
      glow.stopAnimation();
    };
  }, [opacity, scale, tx, glow]);

  if (!banner) return null;

  const tint = rarityColors[banner.rarity];
  const isLegendary = banner.rarity === 'Legendary';
  const isEpicPlus = banner.rarity === 'Epic' || isLegendary;

  return (
    <View pointerEvents="none" style={styles.host}>
      {/*
        Full-screen rarity tint, only for Epic+. Animated opacity is driven by
        the same `glow` value so the tint and the banner border light up
        together. Kept lightweight (a single color overlay) for perf.
      */}
      {isEpicPlus ? (
        <Animated.View
          style={[
            styles.tint,
            {
              backgroundColor: tint,
              opacity: glow.interpolate({
                inputRange: [0, 1],
                outputRange: [0, isLegendary ? 0.26 : 0.12],
              }),
            },
          ]}
        />
      ) : null}

      <Animated.View
        style={[
          styles.banner,
          isLegendary && styles.bannerLegendary,
          {
            borderColor: tint,
            opacity,
            transform: [{ scale }, { translateX: tx }],
            borderWidth: isLegendary ? 3 : isEpicPlus ? 2 : 1,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: tint,
              opacity: glow.interpolate({
                inputRange: [0, 1],
                outputRange: [0, isLegendary ? 0.5 : isEpicPlus ? 0.3 : 0.15],
              }),
            },
          ]}
        />
        {/*
          Row layout:
            [ big icon ]  [ caption + name (wraps up to 2 lines) ]
          The icon is intentionally chunky on mobile because it's the fastest
          shape-recognition cue for "what move is this?".
        */}
        <AppText
          size="display"
          style={[styles.icon, isLegendary && styles.iconLegendary]}
        >
          {banner.icon}
        </AppText>
        <View style={styles.textCol}>
          <AppText size="caption" tone="muted" uppercase numberOfLines={1}>
            {`${banner.target === 'player' ? 'You' : 'Opponent'} • ${banner.rarity} • ${banner.category}`}
          </AppText>
          {/*
            Two-line allowance for long names ("Spinning Heel Submission Lock"
            type). Legendary uses display size; Epic+ uses title; others
            subtitle. adjustsFontSizeToFit keeps it on one screen line until
            the cutoff, then wraps cleanly.
          */}
          <AppText
            size={isLegendary ? 'display' : isEpicPlus ? 'title' : 'subtitle'}
            weight="black"
            style={[styles.name, { color: tint }]}
            numberOfLines={2}
          >
            {banner.name}
          </AppText>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl ?? theme.spacing.lg,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceElevated,
    // Wider banner so long card names breathe. Capped just under full screen
    // on phones; on tablets the maxWidth keeps it from stretching ridiculously.
    width: '92%',
    maxWidth: 560,
    minHeight: 96,
    overflow: 'hidden',
  },
  bannerLegendary: {
    // Slightly taller + more padding makes Legendary visually dominate the
    // screen, which matches the rarity dwell + glow + tint above.
    minHeight: 128,
    paddingVertical: theme.spacing.xl ?? theme.spacing.lg,
  },
  glow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: theme.radii.lg + 8,
  },
  icon: {
    fontSize: 48,
    lineHeight: 56,
  },
  iconLegendary: {
    fontSize: 64,
    lineHeight: 72,
  },
  textCol: {
    flex: 1,
    minWidth: 0, // allow flex children to shrink for proper wrap
    gap: 4,
  },
  name: {
    // Bigger line height to keep two-line names readable.
    lineHeight: undefined,
  },
});
