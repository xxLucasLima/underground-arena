import { StyleSheet, Switch, View } from 'react-native';
import { AppCard, AppText, ScreenContainer, ScreenHeader } from '@/components/base';
import { useSettingsStore } from '@/stores/settingsStore';
import { theme } from '@/themes';

/**
 * Game-feel control surface. Every toggle here corresponds to a settings flag
 * that animation hooks / juice services already respect, so flipping a switch
 * has an immediate effect without restart.
 */
export function SettingsScreen() {
  const settings = useSettingsStore();

  return (
    <ScreenContainer>
      <ScreenHeader title="Settings" subtitle="Game feel" />

      <AppCard variant="elevated">
        <Row
          label="Sound"
          hint="Master switch for all SFX"
          value={settings.soundEnabled}
          onChange={settings.toggleSound}
        />
        <Divider />
        <Row
          label="Haptics"
          hint="Subtle vibration on impacts and rewards"
          value={settings.hapticsEnabled}
          onChange={settings.toggleHaptics}
        />
        <Divider />
        <Row
          label="Visual effects"
          hint="Screen flashes and shakes during combat"
          value={settings.visualEffectsEnabled}
          onChange={settings.toggleVisualEffects}
        />
        <Divider />
        <Row
          label="Reduced motion"
          hint="Disable bouncy animations and slides (accessibility)"
          value={settings.reducedMotion}
          onChange={settings.toggleReducedMotion}
        />
      </AppCard>
    </ScreenContainer>
  );
}

function Row({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <AppText weight="bold">{label}</AppText>
        <AppText size="caption" tone="muted">
          {hint}
        </AppText>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor={value ? theme.colors.primaryGlow : theme.colors.textMuted}
        trackColor={{ true: theme.colors.primaryMuted, false: theme.colors.surfaceAlt }}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.sm },
  divider: { height: 1, backgroundColor: theme.colors.border },
});
