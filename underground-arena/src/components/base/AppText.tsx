import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { theme } from '@/themes';

export type AppTextTone = 'default' | 'muted' | 'dim' | 'accent' | 'gold' | 'danger' | 'success';
export type AppTextSize = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'micro';

type AppTextProps = PropsWithChildren<{
  style?: StyleProp<TextStyle>;
  tone?: AppTextTone;
  size?: AppTextSize;
  weight?: keyof typeof theme.typography.weight;
  numberOfLines?: number;
  uppercase?: boolean;
}>;

const TONE_COLOR: Record<AppTextTone, string> = {
  default: theme.colors.text,
  muted: theme.colors.textMuted,
  dim: theme.colors.textDim,
  accent: theme.colors.primaryGlow,
  gold: theme.colors.gold,
  danger: theme.colors.danger,
  success: theme.colors.success,
};

/**
 * Single typography component. Variants pull from theme tokens so the whole
 * app retypes on one config change.
 */
export function AppText({
  children,
  style,
  tone = 'default',
  size = 'body',
  weight = 'regular',
  numberOfLines,
  uppercase,
}: AppTextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        {
          color: TONE_COLOR[tone],
          fontSize: theme.typography[size],
          fontWeight: theme.typography.weight[weight],
          textTransform: uppercase ? 'uppercase' : undefined,
          letterSpacing: uppercase ? 1 : 0,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { color: theme.colors.text },
});
