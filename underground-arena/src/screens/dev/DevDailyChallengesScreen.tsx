import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppText, ScreenHeader } from '@/components/base';
import { FightResultPanel, OpponentPreview } from '@/components/dev';
import { runEncounterFight, type EncounterFightResult } from '@/services/encounters';
import { useEncounterStore } from '@/stores/encounterStore';
import { useProgressionStore } from '@/stores/progressionStore';
import { usePlayerStore } from '@/stores/playerStore';
import { theme } from '@/themes';

/**
 * Daily challenges dev flow: roll today's set deterministically, view each
 * restriction + reward, fight any challenge, mark complete on win.
 */
export function DevDailyChallengesScreen() {
  const level = useProgressionStore((s) => s.level);
  // playerStore has no `id` yet; use the player's name as the per-account
  // identifier so the daily generator can still derive a per-player seed.
  const playerId = usePlayerStore((s) => s.name);
  const daily = useEncounterStore((s) => s.daily);
  const refreshDailyChallenges = useEncounterStore((s) => s.refreshDailyChallenges);
  const completeDailyChallenge = useEncounterStore((s) => s.completeDailyChallenge);

  const [selectedTpl, setSelectedTpl] = useState<string | null>(null);
  const [result, setResult] = useState<EncounterFightResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refreshDailyChallenges({ playerId, playerLevel: level });
  }, [refreshDailyChallenges, playerId, level]);

  const instance = daily?.instances.find((i) => i.templateId === selectedTpl) ?? null;

  const onFight = async (won?: boolean) => {
    if (!instance || busy) return;
    setBusy(true);
    try {
      const fight = await runEncounterFight({
        opponent: instance.opponent,
        seed: instance.opponent.meta.seed,
        encounter: { kind: 'daily', templateId: instance.templateId },
      });
      const playerWon = won ?? fight.won;
      if (playerWon) await completeDailyChallenge(instance.templateId);
      setResult(fight);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Daily Challenges (dev)" />

        <AppCard>
          <AppText style={styles.section}>{`Date: ${daily?.date ?? '—'}`}</AppText>
          <AppText style={styles.line}>{`Player: ${playerId}  •  Level: ${level}`}</AppText>
          <AppButton
            label="Re-roll (clears & rebuilds)"
            onPress={async () => {
              await useEncounterStore.getState().reset();
              await refreshDailyChallenges({ playerId, playerLevel: level });
            }}
          />
        </AppCard>

        {daily?.instances.map((c) => (
          <AppCard key={c.templateId}>
            <AppButton
              label={`${selectedTpl === c.templateId ? '● ' : '○ '}${c.templateId}${c.completed ? ' ✓' : ''}`}
              onPress={() => setSelectedTpl(c.templateId)}
            />
            <AppText style={styles.line}>{`Restriction: ${c.restriction}`}</AppText>
            <AppText style={styles.line}>
              {`Reward: ${c.reward.xp ?? 0} xp / ${c.reward.coins ?? 0} coins`}
            </AppText>
          </AppCard>
        )) ?? null}

        {instance ? (
          <>
            <OpponentPreview opponent={instance.opponent} label={`Daily • ${instance.templateId}`} />
            <View style={styles.actions}>
              <AppButton label={busy ? 'Fighting…' : 'Fight'} onPress={() => onFight()} disabled={busy} />
              <AppButton label="Force Win (complete)" onPress={() => onFight(true)} disabled={busy} />
              <AppButton label="Force Loss" onPress={() => onFight(false)} disabled={busy} />
            </View>
          </>
        ) : null}

        {result ? <FightResultPanel result={result} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: 10, paddingBottom: 80 },
  section: { fontWeight: '800', fontSize: 14, marginBottom: 6 },
  line: { fontSize: 12, marginTop: 2 },
  actions: { gap: 6 },
});
