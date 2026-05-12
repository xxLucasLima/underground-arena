import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/base';
import { theme } from '@/themes';
import type { StatusEffectType } from '@/types/cards';

/**
 * Compact status indicator chip. Color + glyph map provides instant
 * readability without needing a tooltip system yet (phase 07).
 */
const META: Record<NonNullable<StatusEffectType>, { glyph: string; tint: string }> = {
  bleeding: { glyph: '🩸', tint: '#FF4D6D' },
  stun: { glyph: '✶', tint: '#F5D547' },
  exhaustion: { glyph: '💤', tint: '#9CA3AF' },
  adrenaline: { glyph: '⚡', tint: theme.colors.orange },
  defense_break: { glyph: '🛡', tint: '#D97757' },
  stamina_burn: { glyph: '🔥', tint: '#FF7A1A' },
  combo_boost: { glyph: '⤴', tint: theme.colors.gold },
  accuracy_reduction: { glyph: '🌫', tint: theme.colors.textMuted },
};

export function StatusChip({ status }: { status: NonNullable<StatusEffectType> }) {
  const m = META[status];
  return (
    <View style={[styles.chip, { borderColor: m.tint }]}>
      <AppText size="caption">{m.glyph}</AppText>
      <AppText size="micro" weight="bold" style={{ color: m.tint }} uppercase>
        {status.replace('_', ' ')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
  },
});
