import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppText, ScreenHeader } from '@/components/base';
import { FightResultPanel, OpponentPreview } from '@/components/dev';
import { runEncounterFight, type EncounterFightResult } from '@/services/encounters';
import { useEncounterStore } from '@/stores/encounterStore';
import { useProgressionStore } from '@/stores/progressionStore';
import { theme } from '@/themes';

/**
 * Survival dev flow: start run → fight current opponent (which is regenerated
 * by the service on each win with bumped drift) → see streak + total rewards.
 */
export function DevSurvivalScreen() {
  const level = useProgressionStore((s) => s.level);
  const league = useProgressionStore((s) => s.league);
  const survival = useEncounterStore((s) => s.survival);
  const bestStreak = useEncounterStore((s) => s.completedSurvivalBestStreak);
  const startSurvival = useEncounterStore((s) => s.startSurvival);
  const recordSurvivalMatch = useEncounterStore((s) => s.recordSurvivalMatch);

  const [seed, setSeed] = useState(5500);
  const [result, setResult] = useState<EncounterFightResult | null>(null);
  const [busy, setBusy] = useState(false);

  const onStart = async () => {
    await startSurvival({ seed, league, playerLevel: level });
    setResult(null);
  };

  const onFight = async (won?: boolean) => {
    if (!survival || busy) return;
    setBusy(true);
    try {
      const fight = await runEncounterFight({
        opponent: survival.currentOpponent,
        seed: survival.seed + survival.streak * 131,
        encounter: { kind: 'survival', streak: survival.streak },
      });
      await recordSurvivalMatch({ won: won ?? fight.won, playerLevel: level });
      setResult(fight);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Survival (dev)" />

        <AppCard>
          <AppText style={styles.section}>Run</AppText>
          <AppText style={styles.line}>{survival ? `Streak ${survival.streak}  •  Total coins ${survival.totalRewards.coins}  •  Total XP ${survival.totalRewards.xp}` : 'No run in progress'}</AppText>
          <AppText style={styles.line}>{`Best streak ever: ${bestStreak}`}</AppText>
          <AppText style={styles.line}>{`Seed: ${seed}`}</AppText>
          <View style={styles.row}>
            <AppButton label="Seed +1" onPress={() => setSeed((s) => s + 1)} />
            <AppButton label="Seed +100" onPress={() => setSeed((s) => s + 100)} />
            <AppButton label={survival ? 'Restart' : 'Start Survival'} onPress={onStart} />
          </View>
        </AppCard>

        {survival ? (
          <>
            <OpponentPreview opponent={survival.currentOpponent} label={`Next opponent (streak ${survival.streak})`} />
            <View style={styles.actions}>
              <AppButton label={busy ? 'Fighting…' : 'Fight'} onPress={() => onFight()} disabled={busy} />
              <AppButton label="Force Win" onPress={() => onFight(true)} disabled={busy} />
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
  row: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  actions: { gap: 6 },
});
