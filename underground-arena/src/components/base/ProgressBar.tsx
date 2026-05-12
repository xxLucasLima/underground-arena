import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@/themes';
import { useReducedMotion } from '@/animations/hooks/useReducedMotion';
import { motion } from '@/themes/motion';

type ProgressBarProps = {
  progress: number;
  height?: number;
  /** Track color (defaults to surfaceAlt). */
  trackColor?: string;
  /** Fill color (defaults to primary). */
  color?: string;
  /** Optional secondary "ghost" fill that lerps slowly toward `progress` — used for HP damage trails. */
  trailColor?: string;
  style?: ViewStyle;
};

/**
 * Animated fill bar. Two layers:
 *  - "trail" eases slowly toward target, producing the recognizable
 *    fighting-game "damage trail" / "white bar behind red bar" effect.
 *  - main fill snaps quickly so the player feels the hit instantly.
 *
 * useNativeDriver isn't usable for width, so we keep the JS-driven animation
 * short (160ms) and avoid running it during steady states.
 */
export function ProgressBar({
  progress,
  height = 10,
  trackColor = theme.colors.surfaceAlt,
  color = theme.colors.primary,
  trailColor,
  style,
}: ProgressBarProps) {
  const target = clamp01(progress);
  const main = useRef(new Animated.Value(target)).current;
  const trail = useRef(new Animated.Value(target)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      main.setValue(target);
      trail.setValue(target);
      return;
    }
    Animated.timing(main, {
      toValue: target,
      duration: motion.duration.fast,
      easing: motion.easing.out,
      useNativeDriver: false,
    }).start();
    Animated.timing(trail, {
      toValue: target,
      duration: motion.duration.slow * 1.6,
      easing: motion.easing.out,
      useNativeDriver: false,
    }).start();
  }, [target, main, trail, reduced]);

  const mainWidth = main.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const trailWidth = trail.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }, style]}>
      {trailColor ? (
        <Animated.View style={[styles.fill, { backgroundColor: trailColor, width: trailWidth }]} />
      ) : null}
      <Animated.View style={[styles.fill, { backgroundColor: color, width: mainWidth }]} />
    </View>
  );
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

const styles = StyleSheet.create({
  track: {
    borderRadius: theme.radii.pill,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
});
