import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppButton, AppCard, AppText, ScreenHeader } from '@/components/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createCombatState,
  createRng,
  advanceTurn,
  runMatch,
  simulateMatches,
  type CombatState,
  type RNG,
} from '@/engine/combat';
import { MOCK_OPPONENT, MOCK_PLAYER } from '@/engine/combat/mockFighters';
import { processFightResult, type PostFightSummary } from '@/services/progression/postFight';
import { xpToNextLevel } from '@/services/progression/xp';
import { useProgressionStore } from '@/stores/progressionStore';
import { theme } from '@/themes';

function makeState(seed: number) {
  return {
    state: createCombatState({ playerProfile: MOCK_PLAYER, opponentProfile: MOCK_OPPONENT }),
    rng: createRng(seed),
  };
}

export function CombatDebugScreen() {
  const [seed, setSeed] = useState(1);
  const [{ state, rng }, setRuntime] = useState<{ state: CombatState; rng: RNG }>(() => makeState(1));
  const [simResult, setSimResult] = useState<string>('');
  const [summary, setSummary] = useState<PostFightSummary | null>(null);
  const [processing, setProcessing] = useState(false);
  const progressionLevel = useProgressionStore((s) => s.level);
  const progressionXp = useProgressionStore((s) => s.xp);
  const progressionCoins = useProgressionStore((s) => s.currencies.coins);
  const progressionStreak = useProgressionStore((s) => s.streak);

  const processIfFinished = async (finalState: CombatState) => {
    if (!finalState.finished) return;
    setProcessing(true);
    try {
      const result = await processFightResult({ state: finalState, playerId: MOCK_PLAYER.id, seed });
      setSummary(result);
    } finally {
      setProcessing(false);
    }
  };

  const playerRuntime = state.fighters[MOCK_PLAYER.id];
  const opponentRuntime = state.fighters[MOCK_OPPONENT.id];

  const recentEvents = useMemo(() => state.log.slice(-40).reverse(), [state.log]);

  const onStep = async () => {
    if (state.finished) return;
    const next = advanceTurn(state, rng);
    setRuntime({ state: next, rng });
    if (next.finished) await processIfFinished(next);
  };

  const onAutoRun = async () => {
    let cur = state;
    while (!cur.finished) {
      cur = advanceTurn(cur, rng);
    }
    setRuntime({ state: cur, rng });
    await processIfFinished(cur);
  };

  const onReset = () => {
    setRuntime(makeState(seed));
    setSimResult('');
    setSummary(null);
  };

  const onReseed = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    setRuntime(makeState(nextSeed));
    setSimResult('');
    setSummary(null);
  };

  const onSimulate = () => {
    const r = simulateMatches({
      seedBase: seed,
      matches: 50,
      playerProfile: MOCK_PLAYER,
      opponentProfile: MOCK_OPPONENT,
    });
    setSimResult(`Wins ${r.wins} • Losses ${r.losses} • Draws ${r.draws} • Avg turns ${(r.totalTurns / 50).toFixed(1)}`);
  };

  const onReplay = async () => {
    const finalState = runMatch({ seed, playerProfile: MOCK_PLAYER, opponentProfile: MOCK_OPPONENT });
    setRuntime({ state: finalState, rng: createRng(seed) });
    await processIfFinished(finalState);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        <ScreenHeader title="Combat Debug" />

        <View style={styles.row}>
          <AppText style={styles.meta}>{`Seed: ${seed}`}</AppText>
          <AppText style={styles.meta}>{`Turn: ${state.turn}`}</AppText>
          <AppText style={styles.meta}>
            {state.finished ? `Winner: ${state.winnerId ?? 'Draw'}` : 'In progress'}
          </AppText>
        </View>

        <View style={styles.fighters}>
          <AppCard>
            <AppText style={styles.name}>{MOCK_PLAYER.name}</AppText>
            <AppText>{`HP ${playerRuntime.hp}/${MOCK_PLAYER.maxHp}`}</AppText>
            <AppText>{`STA ${Math.round(playerRuntime.stamina)}/${MOCK_PLAYER.maxStamina}`}</AppText>
            <AppText>{`Momentum ${playerRuntime.comboMomentum}`}</AppText>
            <AppText>{`Effects: ${playerRuntime.effects.map((e) => e.type).join(', ') || 'none'}`}</AppText>
          </AppCard>
          <AppCard>
            <AppText style={styles.name}>{MOCK_OPPONENT.name}</AppText>
            <AppText>{`HP ${opponentRuntime.hp}/${MOCK_OPPONENT.maxHp}`}</AppText>
            <AppText>{`STA ${Math.round(opponentRuntime.stamina)}/${MOCK_OPPONENT.maxStamina}`}</AppText>
            <AppText>{`Momentum ${opponentRuntime.comboMomentum}`}</AppText>
            <AppText>{`Effects: ${opponentRuntime.effects.map((e) => e.type).join(', ') || 'none'}`}</AppText>
          </AppCard>
        </View>

        <View style={styles.actions}>
          <AppButton label="Start / Step Turn" onPress={onStep} />
          <AppButton label="Auto Run to End" onPress={onAutoRun} />
          <AppButton label="Replay Match (seeded)" onPress={onReplay} />
          <AppButton label="Reseed" onPress={onReseed} />
          <AppButton label="Reset" onPress={onReset} />
          <AppButton label="Simulate 50 Matches" onPress={onSimulate} />
        </View>

        {simResult ? <AppText style={styles.sim}>{simResult}</AppText> : null}

        <AppCard>
          <AppText style={styles.name}>Progression</AppText>
          <AppText>{`Level ${progressionLevel}  •  XP ${progressionXp}/${xpToNextLevel(progressionLevel)}`}</AppText>
          <AppText>{`Coins ${progressionCoins}  •  Streak ${progressionStreak}`}</AppText>
        </AppCard>

        {summary ? (
          <AppCard>
            <AppText style={styles.name}>{summary.won ? 'Victory!' : 'Defeat'}</AppText>
            <AppText>{`Turns: ${summary.turns}  •  Winner: ${summary.winnerId ?? 'Draw'}`}</AppText>
            <AppText>{`XP gained: +${summary.rewards.xp}`}</AppText>
            <AppText>{`Coins gained: +${summary.rewards.coins}`}</AppText>
            {summary.levelsGained > 0 ? (
              <AppText style={styles.levelup}>{`LEVEL UP! +${summary.levelsGained} (${summary.before.level} → ${summary.after.level})`}</AppText>
            ) : null}
            <AppText>{`Coins: ${summary.before.coins} → ${summary.after.coins}`}</AppText>
            <AppText>{`XP: ${summary.before.xp} → ${summary.after.xp}`}</AppText>
            <AppText>
              {`Card drops: ${summary.unlockedCardIds.length > 0 ? summary.unlockedCardIds.join(', ') : 'none'}`}
            </AppText>
            {summary.newAchievements.length > 0 ? (
              <AppText style={styles.achievement}>{`Achievements: ${summary.newAchievements.join(', ')}`}</AppText>
            ) : null}
          </AppCard>
        ) : null}
        {processing ? <AppText>Processing rewards…</AppText> : null}

        <AppText style={styles.logHeader}>Combat Log (latest first)</AppText>
        <View style={styles.log}>
          {recentEvents.map((event, idx) => (
            <AppText key={`${event.turn}-${idx}-${event.type}`} style={styles.logLine}>
              {`T${event.turn} • ${event.type} • ${event.message}`}
            </AppText>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { padding: theme.spacing.lg, gap: 8, paddingBottom: 80 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  meta: { fontWeight: '700' },
  fighters: { gap: 8, marginBottom: 12 },
  name: { fontWeight: '700', fontSize: 16 },
  actions: { gap: 8, marginBottom: 12 },
  sim: { fontWeight: '700', marginBottom: 8 },
  logHeader: { fontWeight: '700', marginBottom: 4 },
  log: { borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 8, gap: 4 },
  logLine: { fontSize: 12 },
  levelup: { fontWeight: '700', color: theme.colors.warning },
  achievement: { fontWeight: '700', color: '#7cc4ff' },
});
