import { StyleSheet, View } from 'react-native';
import { AppCard, AppText } from '@/components/base';
import type { AIFighter } from '@/services/opponents';
import { estimateFighterPower } from '@/services/opponents/fighterGenerator';
import { theme } from '@/themes';

/**
 * Developer-facing opponent panel. Surfaces all generator outputs in one
 * compact card so designers can sanity-check the matchmaking output.
 *
 * Not polished UI — purely a diagnostic block. The future combat/fight
 * screens will render proper presentation.
 */
export function OpponentPreview({ opponent, label }: { opponent: AIFighter; label?: string }) {
  const { profile, meta } = opponent;
  const power = Math.round(estimateFighterPower(opponent));
  return (
    <AppCard>
      {label ? <AppText style={styles.label}>{label}</AppText> : null}
      <AppText style={styles.name}>{profile.name}</AppText>
      <AppText style={styles.sub}>
        {`${meta.fightingStyle} • ${meta.archetypeId} • ${profile.personality}`}
      </AppText>
      <View style={styles.row}>
        <Badge text={`Tier: ${meta.tier}`} tone="primary" />
        <Badge text={`League: ${meta.league}`} tone="neutral" />
        <Badge text={meta.rarity === 'Boss' ? '★ BOSS' : 'Standard'} tone={meta.rarity === 'Boss' ? 'danger' : 'neutral'} />
      </View>
      <AppText style={styles.statline}>{`HP ${profile.maxHp}  •  STA ${profile.maxStamina}  •  Power ~${power}`}</AppText>
      <AppText style={styles.statline}>
        {`STR ${profile.stats.strength}  SPD ${profile.stats.speed}  CAR ${profile.stats.cardio}  TEC ${profile.stats.technique}  DEF ${profile.stats.defense}  CHN ${profile.stats.chin}  AGR ${profile.stats.aggression}`}
      </AppText>
      <AppText style={styles.statline}>{`Deck (${profile.deck.length}): ${profile.deck.map((c) => c.name).join(', ')}`}</AppText>
      <AppText style={styles.meta}>{`Seed: ${meta.seed}${meta.bossId ? ` • bossId: ${meta.bossId}` : ''}`}</AppText>
    </AppCard>
  );
}

function Badge({ text, tone }: { text: string; tone: 'primary' | 'neutral' | 'danger' }) {
  const bg =
    tone === 'primary' ? theme.colors.primary : tone === 'danger' ? '#a63a3a' : '#333';
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <AppText style={styles.badgeText}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '700', color: theme.colors.textMuted ?? '#8aa', marginBottom: 4, fontSize: 12, textTransform: 'uppercase' },
  name: { fontWeight: '800', fontSize: 16, color: theme.colors.text },
  sub: { fontSize: 12, color: theme.colors.textMuted ?? '#999', marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  statline: { fontSize: 12, marginTop: 2 },
  meta: { fontSize: 10, color: '#777', marginTop: 4 },
});
