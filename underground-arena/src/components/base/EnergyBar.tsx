import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { ProgressBar } from './ProgressBar';
import { theme } from '@/themes';

type EnergyBarProps = {
  current: number;
  max: number;
  compact?: boolean;
};

export function EnergyBar({ current, max, compact }: EnergyBarProps) {
  const progress = max <= 0 ? 0 : current / max;
  return (
    <View style={styles.container}>
      {!compact ? (
        <AppText size="caption" tone="muted" uppercase>{`Energy ${current}/${max}`}</AppText>
      ) : null}
      <ProgressBar
        progress={progress}
        color={theme.colors.gold}
        trailColor={'#3A2E12'}
        height={compact ? 6 : 8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
});
