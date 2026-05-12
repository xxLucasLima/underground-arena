import { Easing, withTiming } from 'react-native-reanimated';

const defaultConfig = {
  duration: 240,
  easing: Easing.out(Easing.cubic),
};

export const fadeIn = () => withTiming(1, defaultConfig);
export const fadeOut = () => withTiming(0, defaultConfig);
export const scaleIn = () => withTiming(1, defaultConfig);
export const slideUp = (toValue = 0) => withTiming(toValue, defaultConfig);
