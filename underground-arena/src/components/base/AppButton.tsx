import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '@/themes';

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function AppButton({ label, onPress, disabled }: AppButtonProps) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.disabled]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
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
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '700',
  },
});
