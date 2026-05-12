import { StyleSheet } from 'react-native';
import { AppCard, AppText } from '@/components/base';
import type { EncounterFightResult } from '@/services/encounters';
import { theme } from '@/themes';

/**
 * Dev-only summary panel. Shows the canonical reward (already applied to
 * progression by postFight) AND the encounter-scaled preview side-by-side so
 * balancers can see what the final reward pipeline should output once mode
 * multipliers are integrated into the reward service.
 */
export function FightResultPanel({ result }: { result: EncounterFightResult }) {
  const { won, summary, event, rewardPreview, state } = result;
  return (
    <AppCard>
      <AppText style={[styles.title, { color: won ? theme.colors.success : theme.colors.primary }]}>
        {won ? 'VICTORY' : 'DEFEAT'}
      </AppText>
      <AppText style={styles.line}>{`Turns: ${state.turn}  •  Winner: ${summary.winnerId ?? 'Draw'}`}</AppText>
      <AppText style={styles.line}>{`XP +${summary.rewards.xp}  •  Coins +${summary.rewards.coins}`}</AppText>
      <AppText style={styles.line}>
        {`Encounter-scaled preview → XP ${rewardPreview.scaled.xp} / Coins ${rewardPreview.scaled.coins}  (x${rewardPreview.multiplier.toFixed(2)})`}
      </AppText>
      {summary.levelsGained > 0 ? (
        <AppText style={styles.levelup}>{`LEVEL UP! ${summary.before.level} → ${summary.after.level}`}</AppText>
      ) : null}
      {summary.unlockedCardIds.length > 0 ? (
        <AppText style={styles.line}>{`Card drops: ${summary.unlockedCardIds.join(', ')}`}</AppText>
      ) : null}
      {summary.newAchievements.length > 0 ? (
        <AppText style={styles.line}>{`Achievements: ${summary.newAchievements.join(', ')}`}</AppText>
      ) : null}
      {event ? (
        <AppText style={styles.event}>{`★ Procedural event: ${event.name} — ${event.description}`}</AppText>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '800', fontSize: 16, marginBottom: 4 },
  line: { fontSize: 12, marginTop: 2 },
  levelup: { fontSize: 13, fontWeight: '700', color: theme.colors.warning, marginTop: 4 },
  event: { fontSize: 12, color: '#7cc4ff', marginTop: 6, fontStyle: 'italic' },
});
