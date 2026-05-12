import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppText, ScreenHeader } from '@/components/base';
import { FightResultPanel, OpponentPreview } from '@/components/dev';
import { runEncounterFight, type EncounterFightResult } from '@/services/encounters';
import {
  appendHistory,
  pickOpponent,
  type AIFighter,
  type OpponentHistoryEntry,
  type RecentFightResult,
} from '@/services/opponents';
import { computeDifficultyDrift } from '@/services/opponents/fighterGenerator';
import { useEncounterStore } from '@/stores/encounterStore';
import { useProgressionStore } from '@/stores/progressionStore';
import { useCardsStore } from '@/stores/cardsStore';
import { theme } from '@/themes';

/**
 * Validates the matchmaking pipeline end-to-end:
 *   recent results → drift → opponent generation → history → fight → rewards.
 *
 * Persists nothing of its own beyond what the encounter & progression stores
 * already manage.
 */
export function DevMatchmakingScreen() {
  const level = useProgressionStore((s) => s.level);
  const league = useProgressionStore((s) => s.league);
  const history = useEncounterStore((s) => s.history);
  const recentResults = useEncounterStore((s) => s.recentResults);
  const recordFight = useEncounterStore((s) => s.recordFight);
  const ownedCardCount = useCardsStore((s) => Object.keys(s.owned).length);

  const [seedBase, setSeedBase] = useState(1000);
  const [opponent, setOpponent] = useState<AIFighter | null>(null);
  const [result, setResult] = useState<EncounterFightResult | null>(null);
  const [busy, setBusy] = useState(false);

  const drift = computeDifficultyDrift({
    playerLevel: level,
    league,
    recentResults,
    history,
    ownedCardCount,
    playerDeckPower: 0,
  });

  const onPick = () => {
    const next = pickOpponent(
      {
        playerLevel: level,
        league,
        recentResults,
        history,
        ownedCardCount,
        playerDeckPower: 0,
      },
      seedBase,
    );
    setOpponent(next);
    setResult(null);
  };

  const onFight = async () => {
    if (!opponent || busy) return;
    setBusy(true);
    try {
      const fight = await runEncounterFight({
        opponent,
        seed: opponent.meta.seed,
        encounter: { kind: 'matchmaking' },
      });
      const entry: OpponentHistoryEntry = {
        seed: opponent.meta.seed,
        archetypeId: opponent.meta.archetypeId,
        league: opponent.meta.league,
        tier: opponent.meta.tier,
        isBoss: opponent.meta.rarity === 'Boss',
        at: Date.now(),
      };
      const res: RecentFightResult = { won: fight.won, opponentSeed: opponent.meta.seed };
      await recordFight(entry, res);
      setResult(fight);
      setSeedBase((s) => s + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Matchmaking (dev)" />

        <AppCard>
          <AppText style={styles.section}>Context</AppText>
          <AppText style={styles.line}>{`Level ${level}  •  League ${league}`}</AppText>
          <AppText style={styles.line}>{`Recent results window: ${recentResults.length}`}</AppText>
          <AppText style={styles.line}>{`Difficulty drift: ${drift.toFixed(3)}  (negative = relief, positive = hot streak)`}</AppText>
          <AppText style={styles.line}>{`History entries: ${history.length}`}</AppText>
          <AppText style={styles.line}>{`Seed base: ${seedBase}`}</AppText>
        </AppCard>

        <View style={styles.actions}>
          <AppButton label="Pick Opponent" onPress={onPick} />
          <AppButton label={busy ? 'Fighting…' : 'Fight'} onPress={onFight} disabled={!opponent || busy} />
          <AppButton label="Bump Seed" onPress={() => setSeedBase((s) => s + 100)} />
        </View>

        {opponent ? <OpponentPreview opponent={opponent} label="Generated Opponent" /> : null}
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
