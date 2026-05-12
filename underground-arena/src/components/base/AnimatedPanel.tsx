import { PropsWithChildren } from 'react';
import { Animated } from 'react-native';
import { useFadeIn } from '@/animations/hooks/useFadeIn';

/**
 * Thin wrapper around `useFadeIn`. Useful when wrapping individual sections
 * inside an already-mounted screen (e.g. revealing a sub-panel after async).
 */
export function AnimatedPanel({ children, delay = 0 }: PropsWithChildren<{ delay?: number }>) {
  const { opacity, translateY } = useFadeIn(delay);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}
