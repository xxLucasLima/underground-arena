import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppText, ScreenHeader } from '@/components/base';
import { FightResultPanel, OpponentPreview } from '@/components/dev';
import { runEncounterFight, type EncounterFightResult } from '@/services/encounters';
import { materializeRival, type Rival } from '@/services/opponents/rivals';
import { useEncounterStore } from '@/stores/encounterStore';
import { useProgressionStore } from '@/stores/progressionStore';
import { theme } from '@/themes';

/**
 * Rival dev flow: promote a synthetic rival → re-fight to evolve them →
 * track running W/L. Uses the same encounter pipeline so reward scaling
 * matches matchmaking.
 */
export function DevRivalsScreen() {
  const level = useProgressionStore((s) => s.level);
  const league = useProgressionStore((s) => s.league);
  const rivals = useEncounterStore((s) => s.rivals);
  const tryPromoteRival = useEncounterStore((s) => s.tryPromoteRival);
  const recordRivalEncounter = useEncounterStore((s) => s.recordRivalEncounter);

  const [seed, setSeed] = useState(20250);
  const [active, setActive] = useState<Rival | null>(null);
  const [result, setResult] = useState<EncounterFightResult | null>(null);
  const [busy, setBusy] = useState(false);

  const onPromote = async () => {
    // For dev, treat every promotion as a "close fight" so it always succeeds
    // up to the rival cap.
    const r = await tryPromoteRival({
      seed,
      archetypeId: 'brawler',
      league,
      closeFight: true,
    });
    if (r) setActive(r);
    setSeed((s) => s + 1);
  };

  const onFight = async (won?: boolean) => {
    if (!active || busy) return;
    setBusy(true);
    try {
      const opponent = materializeRival(active, { playerLevel: level });
      const fight = await runEncounterFight({
        opponent,
        seed: active.seed + active.encounters * 17,
        encounter: { kind: 'rival', encounters: active.encounters },
      });
      const playerWon = won ?? fight.won;
      await recordRivalEncounter(active.seed, playerWon);
      // Refresh local view from store
      const updated = useEncounterStore.getState().rivals.find((r) => r.seed === active.seed) ?? null;
      setActive(updated);
      setResult(fight);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Rivals (dev)" />

        <AppCard>
          <AppText style={styles.section}>{`Rivals (${rivals.length}/3)`}</AppText>
          {rivals.length === 0 ? (
            <AppText style={styles.line}>No rivals yet — promote one below.</AppText>
          ) : (
            rivals.map((r) => (
              <AppButton
                key={r.id}
                label={`${active?.id === r.id ? '● ' : '○ '}${r.archetypeId} #${r.seed}  •  enc ${r.encounters}  W${r.playerWins}/L${r.rivalWins}`}
                onPress={() => setActive(r)}
              />
            ))
          )}
          <AppText style={styles.line}>{`Promote seed: ${seed}`}</AppText>
          <View style={styles.row}>
            <AppButton label="Seed +1" onPress={() => setSeed((s) => s + 1)} />
            <AppButton label="Seed +100" onPress={() => setSeed((s) => s + 100)} />
            <AppButton label="Promote Rival" onPress={onPromote} />
          </View>
        </AppCard>

        {active ? (
          <>
            <OpponentPreview
              opponent={materializeRival(active, { playerLevel: level })}
              label={`Rival • encounter ${active.encounters + 1}`}
            />
            <View style={styles.actions}>
              <AppButton label={busy ? 'Fighting…' : 'Fight Rival'} onPress={() => onFight()} disabled={busy} />
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
