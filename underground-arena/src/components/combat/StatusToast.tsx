import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/base';
import { feedbackBus } from '@/feedback/feedbackBus';
import type { FeedbackCue } from '@/feedback/types';
import { theme } from '@/themes';
import { motion } from '@/themes/motion';
import { useReducedMotion } from '@/animations/hooks/useReducedMotion';
import type { StatusEffectType } from '@/types/cards';

/**
 * StatusToast — small, ephemeral toasts for status-effect application /
 * expiration. Sits in the upper third of the fight screen and stacks the last
 * N effects (most recent on top, others fade out behind it).
 *
 * Why a separate layer (vs. piggybacking on MoveBanner):
 *  - Status events fire at different cadence than card plays (sometimes 2-3
 *    statuses per single cardPlayed).
 *  - Visually we want a stacked feed, not one big centerpiece.
 *
 * Keeps engine code untouched — listens to the bus and renders.
 */

type ToastEntry = {
  id: number;
  status: NonNullable<StatusEffectType>;
  applied: boolean;
  target: 'player' | 'opponent';
  opacity: Animated.Value;
  ty: Animated.Value;
  /** Per-toast in-flight animation handle, stopped on unmount. */
  anim: Animated.CompositeAnimation | null;
};

const STATUS_LABEL: Record<NonNullable<StatusEffectType>, string> = {
  bleeding: 'Bleeding',
  stun: 'Stunned',
  exhaustion: 'Exhausted',
  adrenaline: 'Adrenaline',
  defense_break: 'Defense Broken',
  stamina_burn: 'Stamina Burn',
  combo_boost: 'Combo Boost',
  accuracy_reduction: 'Off-balance',
};

const STATUS_TINT: Record<NonNullable<StatusEffectType>, string> = {
  bleeding: theme.colors.danger,
  stun: theme.colors.warning,
  exhaustion: theme.colors.textMuted,
  adrenaline: theme.colors.gold,
  defense_break: theme.colors.primaryGlow,
  stamina_burn: theme.colors.orange,
  combo_boost: theme.colors.gold,
  accuracy_reduction: theme.colors.neon,
};

const MAX_VISIBLE = 4;
const DWELL_MS = 1400;

let nextId = 1;

export function StatusToast() {
  const [entries, setEntries] = useState<ToastEntry[]>([]);
  const reduced = useReducedMotion();
  const entriesRef = useRef<ToastEntry[]>([]);
  entriesRef.current = entries;

  useEffect(() => {
    const off = feedbackBus.on((cue: FeedbackCue) => {
      if (cue.kind !== 'status') return;
      const opacity = new Animated.Value(0);
      const ty = new Animated.Value(-12);
      const entry: ToastEntry = {
        id: nextId++,
        status: cue.status,
        applied: cue.applied,
        target: cue.target,
        opacity,
        ty,
        anim: null,
      };

      setEntries((prev) => [entry, ...prev].slice(0, MAX_VISIBLE));

      if (reduced) {
        opacity.setValue(1);
        ty.setValue(0);
      } else {
        const anim = Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: motion.duration.fast,
            easing: motion.easing.out,
            useNativeDriver: true,
          }),
          Animated.timing(ty, {
            toValue: 0,
            duration: motion.duration.normal,
            easing: motion.easing.bounce,
            useNativeDriver: true,
          }),
        ]);
        entry.anim = anim;
        anim.start();
      }

      // Schedule fade-out + removal. Using setTimeout (not Animated.delay) so
      // we can reliably remove the entry from state in finalize.
      setTimeout(() => {
        const fade = Animated.timing(opacity, {
          toValue: 0,
          duration: motion.duration.fast,
          easing: motion.easing.in,
          useNativeDriver: true,
        });
        entry.anim = fade;
        fade.start(() => {
          setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        });
      }, DWELL_MS);
    });
    return off;
  }, [reduced]);

  // Stop all in-flight animations on unmount so post-Rewards transitions can't
  // deliver frames into freed views.
  useEffect(() => {
    return () => {
      for (const e of entriesRef.current) {
        e.anim?.stop();
        e.opacity.stopAnimation();
        e.ty.stopAnimation();
      }
    };
  }, []);

  if (entries.length === 0) return null;

  return (
    <View pointerEvents="none" style={styles.host}>
      {entries.map((e, i) => {
        const tint = STATUS_TINT[e.status];
        return (
          <Animated.View
            key={e.id}
            style={[
              styles.toast,
              {
                borderColor: tint,
                opacity: e.opacity,
                transform: [{ translateY: e.ty }],
                // Older entries shrink visually so the stack reads as a feed.
                marginTop: i === 0 ? 0 : 4,
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: tint }]} />
            <AppText size="caption" tone="muted" uppercase>
              {e.target === 'player' ? 'You' : 'Opponent'}
            </AppText>
            <AppText size="caption" weight="bold" style={{ color: tint }}>
              {`${e.applied ? '+' : '-'} ${STATUS_LABEL[e.status]}`}
            </AppText>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 4,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceElevated,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
