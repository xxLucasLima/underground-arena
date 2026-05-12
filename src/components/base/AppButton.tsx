import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '@/themes';

type AppButtonProps = {
  label: string;
  onPress?: () => void;
};

export function AppButton({ label, onPress }: AppButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  label: {
    color: theme.colors.text,
    fontWeight: '700',
  },
});
