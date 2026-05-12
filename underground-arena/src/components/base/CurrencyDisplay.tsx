import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { theme } from '@/themes';

type CurrencyDisplayProps = {
  coins: number;
  gems: number;
  compact?: boolean;
};

/**
 * Read-only metallic chip row. Icons are emoji glyphs for now — phase 07 will
 * swap in proper asset icons without changing the layout contract.
 */
export function CurrencyDisplay({ coins, gems, compact }: CurrencyDisplayProps) {
  return (
    <View style={styles.row}>
      <Chip glyph="🪙" value={coins} tint={theme.colors.gold} compact={compact} />
      <Chip glyph="💎" value={gems} tint={theme.colors.neon} compact={compact} />
    </View>
  );
}

function Chip({ glyph, value, tint, compact }: { glyph: string; value: number; tint: string; compact?: boolean }) {
  return (
    <View style={[styles.chip, compact && styles.chipCompact, { borderColor: tint }]}>
      <AppText>{glyph}</AppText>
      <AppText weight="bold" style={{ color: tint }}>{value.toLocaleString()}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
  },
  chipCompact: { paddingVertical: 3, paddingHorizontal: theme.spacing.sm },
});
