import { PropsWithChildren, useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { initializeDatabase } from '@/database/init';
import { AppText } from '@/components/base';
import { theme } from '@/themes';

export function AppBootstrap({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        await initializeDatabase();
        setReady(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown bootstrap error';
        setError(message);
      }
    }

    bootstrap();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <AppText>Initialization error:</AppText>
        <AppText>{error}</AppText>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={theme.colors.primary} />
        <AppText>Loading Underground Arena...</AppText>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
});
