import { PropsWithChildren, useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { fadeIn } from '@/animations/transitions';

export function AnimatedPanel({ children }: PropsWithChildren) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = fadeIn();
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
