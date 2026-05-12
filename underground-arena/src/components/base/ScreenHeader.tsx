import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { theme } from '@/themes';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.accent} />
      <AppText size="title" weight="black" uppercase>
        {title}
      </AppText>
      {subtitle ? (
        <AppText size="caption" tone="muted" uppercase style={styles.sub}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    gap: 4,
  },
  accent: {
    width: 36,
    height: 3,
    backgroundColor: theme.colors.primaryGlow,
    borderRadius: theme.radii.pill,
    marginBottom: theme.spacing.xs,
  },
  sub: { letterSpacing: 1.2 },
});
