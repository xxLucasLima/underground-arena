import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { theme } from '@/themes';

type ScreenHeaderProps = {
  title: string;
};

export function ScreenHeader({ title }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
  },
});
