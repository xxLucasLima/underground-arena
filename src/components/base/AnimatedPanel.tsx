import { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { animationDurations } from '@/animations/transitions';

export function AnimatedPanel({ children }: PropsWithChildren) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: animationDurations.normal,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}
