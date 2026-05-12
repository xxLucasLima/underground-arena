import { PropsWithChildren } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { theme } from '@/themes';

export function ScreenContainer({ children }: PropsWithChildren) {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
});
