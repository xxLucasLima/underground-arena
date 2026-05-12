import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/themes';
import { usePressScale } from '@/animations/hooks/usePressScale';
import { haptics } from '@/services/juice/haptics';
import { audio } from '@/services/juice/audio';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  style?: ViewStyle;
};

/**
 * Polished tactile button.
 *  - Press-in scale → bounce-out (`usePressScale`) for micro-interaction.
 *  - Haptic `selection` + `menu-click` sound on press (settings-aware).
 *  - Variants map to semantic theme tokens, not raw colors.
 *  - Honors reducedMotion automatically via the scale hook.
 */
export function AppButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  style,
}: AppButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale();

  const handlePress = () => {
    if (disabled) return;
    haptics.selection();
    audio.play('menu-click');
    onPress?.();
  };

  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <Animated.View
      style={[
        { transform: [{ scale }] },
        fullWidth ? styles.full : null,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          variantStyle.container,
          sizeStyle.container,
          disabled && styles.disabled,
          pressed && styles.pressed,
          style,
        ]}
      >
        <AppText style={[styles.label, variantStyle.label, sizeStyle.label]}>{label}</AppText>
      </Pressable>
    </Animated.View>
  );
}

const VARIANT_STYLES: Record<Variant, { container: ViewStyle; label: any }> = {
  primary: {
    container: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primaryGlow,
      borderWidth: 1,
      ...theme.shadows.card,
    },
    label: { color: theme.colors.text },
  },
  secondary: {
    container: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.borderStrong,
      borderWidth: 1,
    },
    label: { color: theme.colors.text },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    label: { color: theme.colors.textMuted },
  },
  danger: {
    container: {
      backgroundColor: theme.colors.danger,
      borderColor: theme.colors.primaryGlow,
      borderWidth: 1,
      ...theme.shadows.glowRed,
    },
    label: { color: theme.colors.text },
  },
};

const SIZE_STYLES: Record<Size, { container: ViewStyle; label: any }> = {
  sm: {
    container: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
    label: { fontSize: theme.typography.caption },
  },
  md: {
    container: { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg },
    label: { fontSize: theme.typography.body },
  },
  lg: {
    container: { paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.xl },
    label: { fontSize: theme.typography.subtitle },
  },
};

const styles = StyleSheet.create({
  full: { alignSelf: 'stretch' },
  base: {
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.92 },
  disabled: { opacity: 0.4 },
  label: { fontWeight: theme.typography.weight.bold, letterSpacing: 0.4 },
});
