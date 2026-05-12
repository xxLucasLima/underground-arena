import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@/themes';

type AppCardVariant = 'default' | 'elevated' | 'hero' | 'highlight' | 'danger';

type AppCardProps = PropsWithChildren<{
  variant?: AppCardVariant;
  padding?: keyof typeof theme.spacing;
  style?: ViewStyle;
}>;

/**
 * Metallic surface container. Variants drive the visual hierarchy:
 *  - default: regular content
 *  - elevated: foreground panels (deck previews, opponent header)
 *  - hero: full-bleed key surfaces (main menu hero, victory)
 *  - highlight: warm-tinted (rewards, level ups)
 *  - danger: red-tinted (KO, defeat)
 */
export function AppCard({
  children,
  variant = 'default',
  padding = 'lg',
  style,
}: AppCardProps) {
  const v = VARIANTS[variant];
  return <View style={[styles.base, v, { padding: theme.spacing[padding] }, style]}>{children}</View>;
}

const VARIANTS: Record<AppCardVariant, ViewStyle> = {
  default: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    ...theme.shadows.card,
  },
  elevated: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    ...theme.shadows.elevated,
  },
  hero: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.primaryMuted,
    borderWidth: 1,
    ...theme.shadows.hero,
  },
  highlight: {
    backgroundColor: '#1F1A12',
    borderColor: theme.colors.gold,
    borderWidth: 1,
    ...theme.shadows.glow,
  },
  danger: {
    backgroundColor: '#1B0E10',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    ...theme.shadows.glowRed,
  },
};

const styles = StyleSheet.create({
  base: { borderRadius: theme.radii.lg },
});
