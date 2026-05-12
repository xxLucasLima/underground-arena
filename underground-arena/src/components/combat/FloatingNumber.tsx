import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { motion } from '@/themes/motion';
import { theme } from '@/themes';

export type FloatingNumberProps = {
  value: number;
  /** 0 = at anchor, negative goes left, positive right. */
  jitter?: number;
  critical?: boolean;
  onDone?: () => void;
};

/**
 * Self-animating damage number. Rises ~60px, fades out, calls onDone.
 *
 * Game-feel rationale:
 *  - Vertical rise reads as "damage spat upward" — universal language.
 *  - Critical hits scale up + use the critical color for instant readability.
 *  - Native driver throughout → cheap to spawn many.
 */
export function FloatingNumber({ value, jitter = 0, critical, onDone }: FloatingNumberProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(critical ? 0.6 : 0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: motion.duration.slow,
          delay: 280,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(ty, {
        toValue: -60,
        duration: motion.duration.hero,
        easing: motion.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: critical ? 1.35 : 1,
        duration: motion.duration.fast,
        easing: motion.easing.bounce,
        useNativeDriver: true,
      }),
    ]).start(() => onDone?.());
  }, [opacity, ty, scale, critical, onDone]);

  return (
    <Animated.Text
      style={[
        styles.text,
        critical ? styles.critical : null,
        {
          opacity,
          transform: [{ translateX: jitter }, { translateY: ty }, { scale }],
        },
      ]}
    >
      {critical ? `‼ ${value}` : value}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
    textShadowColor: '#000',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 2 },
  },
  critical: {
    fontSize: 28,
    color: theme.colors.critical,
  },
});
