import { PropsWithChildren } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/themes';
import { useFadeIn } from '@/animations/hooks/useFadeIn';

type ScreenContainerProps = PropsWithChildren<{
  /** Skip the fade-in (when an enclosing screen already animates). */
  noAnimation?: boolean;
  /** Skip default padding for full-bleed screens (e.g. Fight). */
  bleed?: boolean;
  style?: ViewStyle;
}>;

/**
 * Default mount transition: short fade + slide-up via `useFadeIn`.
 * Why per-screen and not in the navigator: native-stack transitions handle
 * push/pop fine; this hook handles internal content settle which feels more
 * intentional and is easy to disable per-screen.
 */
export function ScreenContainer({ children, noAnimation, bleed, style }: ScreenContainerProps) {
  const { opacity, translateY } = useFadeIn();
  const inner = bleed ? (
    <View style={[styles.bleedContent, style]}>{children}</View>
  ) : (
    <View style={[styles.content, style]}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {noAnimation ? (
        inner
      ) : (
        <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>{inner}</Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  bleedContent: { flex: 1 },
});
