import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppText, ScreenHeader } from '@/components/base';
import { FightResultPanel, OpponentPreview } from '@/components/dev';
import { TOURNAMENT_TEMPLATES, type TournamentTemplateId } from '@/data/tournaments/tournamentTemplates';
import { currentMatch } from '@/services/tournaments';
import { runEncounterFight, type EncounterFightResult } from '@/services/encounters';
import { useEncounterStore } from '@/stores/encounterStore';
import { useProgressionStore } from '@/stores/progressionStore';
import { theme } from '@/themes';

/**
 * Tournament dev flow: pick template → start → fight current round →
 * progress / get eliminated → cumulative purse display.
 *
 * Uses encounterStore.startTournament & recordTournamentMatch so all state
 * is the same the real UI will consume later.
 */
export function DevTournamentsScreen() {
  const level = useProgressionStore((s) => s.level);
  const tournament = useEncounterStore((s) => s.tournament);
  const startTournament = useEncounterStore((s) => s.startTournament);
  const recordTournamentMatch = useEncounterStore((s) => s.recordTournamentMatch);
  const abandonTournament = useEncounterStore((s) => s.abandonTournament);
  const completedIds = useEncounterStore((s) => s.completedTournamentIds);

  const [selected, setSelected] = useState<TournamentTemplateId>('amateur-cup');
  const [seed, setSeed] = useState(7777);
  const [result, setResult] = useState<EncounterFightResult | null>(null);
  const [busy, setBusy] = useState(false);

  const match = useMemo(() => (tournament ? currentMatch(tournament) : null), [tournament]);

  const onStart = async () => {
    await startTournament({ templateId: selected, seed, playerLevel: level });
    setResult(null);
  };

  const onFight = async (won?: boolean) => {
    if (busy || !tournament || !match) return;
    setBusy(true);
    try {
      const fight = await runEncounterFight({
        opponent: match.opponent,
        seed: seed + tournament.currentRound * 31,
        encounter: { kind: 'tournament', round: tournament.currentRound },
      });
      const outcome = won ?? fight.won;
      await recordTournamentMatch(outcome);
      setResult(fight);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Tournaments (dev)" />

        {!tournament ? (
          <AppCard>
            <AppText style={styles.section}>Select template</AppText>
            {TOURNAMENT_TEMPLATES.map((t) => (
              <AppButton
                key={t.id}
                label={`${selected === t.id ? '● ' : '○ '}${t.name} (lv ${t.unlockLevel}, fee ${t.entryFee})`}
                onPress={() => setSelected(t.id)}
              />
            ))}
            <AppText style={styles.line}>{`Seed: ${seed}`}</AppText>
            <View style={styles.row}>
              <AppButton label="Seed +1" onPress={() => setSeed((s) => s + 1)} />
              <AppButton label="Seed +100" onPress={() => setSeed((s) => s + 100)} />
            </View>
            <AppButton label="Start Tournament" onPress={onStart} />
          </AppCard>
        ) : (
          <AppCard>
            <AppText style={styles.section}>{`${tournament.templateId} • ${tournament.state}`}</AppText>
            <AppText style={styles.line}>{`Round: ${tournament.currentRound}`}</AppText>
            <AppText style={styles.line}>{`Earned so far: ${tournament.earnedRewards.coins}g  •  ${tournament.earnedRewards.xp}xp`}</AppText>
            <AppText style={styles.line}>
              {tournament.bracket
                .map((m) => `R${m.round}:${m.result ?? '—'}`)
                .join('  ')}
            </AppText>
            <View style={styles.row}>
              <AppButton label="Abandon" onPress={() => abandonTournament()} />
            </View>
          </AppCard>
        )}

        {match ? <OpponentPreview opponent={match.opponent} label={`Round ${match.round} opponent`} /> : null}

        {tournament && match ? (
          <View style={styles.actions}>
            <AppButton label={busy ? 'Fighting…' : 'Fight Round'} onPress={() => onFight()} disabled={busy} />
            <AppButton label="Force Win" onPress={() => onFight(true)} disabled={busy} />
            <AppButton label="Force Loss" onPress={() => onFight(false)} disabled={busy} />
          </View>
        ) : null}

        {result ? <FightResultPanel result={result} /> : null}

        <AppCard>
          <AppText style={styles.section}>Completed tournaments</AppText>
          <AppText style={styles.line}>{completedIds.length === 0 ? 'none' : completedIds.join(', ')}</AppText>
        </AppCard>
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
