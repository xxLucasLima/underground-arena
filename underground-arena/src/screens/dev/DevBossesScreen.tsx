import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppText, ScreenHeader } from '@/components/base';
import { FightResultPanel, OpponentPreview } from '@/components/dev';
import { BOSSES } from '@/data/opponents/bosses';
import { runEncounterFight, type EncounterFightResult } from '@/services/encounters';
import { generateAIFighter } from '@/services/opponents/fighterGenerator';
import { useEncounterStore } from '@/stores/encounterStore';
import { useProgressionStore } from '@/stores/progressionStore';
import { theme } from '@/themes';

/**
 * Boss dev flow: list all bosses, show unlock-after-fights / defeated state,
 * generate the actual AIFighter via the standard generator (passing `boss`),
 * and run the fight through the encounter pipeline so the boss multiplier is
 * surfaced in the reward preview.
 */
export function DevBossesScreen() {
  const level = useProgressionStore((s) => s.level);
  const totalFights = useProgressionStore((s) => s.totals.fights);
  const bossVictories = useEncounterStore((s) => s.bossVictories);
  const recordBossVictory = useEncounterStore((s) => s.recordBossVictory);

  const [selectedId, setSelectedId] = useState<string>(BOSSES[0]?.id ?? '');
  const [result, setResult] = useState<EncounterFightResult | null>(null);
  const [busy, setBusy] = useState(false);

  const boss = useMemo(() => BOSSES.find((b) => b.id === selectedId) ?? BOSSES[0], [selectedId]);
  const opponent = useMemo(
    () =>
      generateAIFighter({
        seed: boss.seed,
        league: boss.league,
        archetypeId: boss.archetypeId,
        tier: boss.tier,
        effectiveLevel: Math.max(level, 1),
        boss,
      }),
    [boss, level],
  );
  const defeated = bossVictories.some((b) => b.bossId === boss.id);
  const unlocked = totalFights >= boss.unlockAfterFights;

  const onFight = async (won?: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      const fight = await runEncounterFight({
        opponent,
        seed: boss.seed,
        encounter: { kind: 'boss', bossId: boss.id },
      });
      const playerWon = won ?? fight.won;
      if (playerWon) await recordBossVictory(boss.id);
      setResult(fight);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Bosses (dev)" />

        <AppCard>
          <AppText style={styles.section}>{`Total fights: ${totalFights}`}</AppText>
          {BOSSES.map((b) => {
            const isDefeated = bossVictories.some((v) => v.bossId === b.id);
            const isUnlocked = totalFights >= b.unlockAfterFights;
            return (
              <AppButton
                key={b.id}
                label={`${selectedId === b.id ? '● ' : '○ '}${b.nickname} (${b.league})  •  ${isDefeated ? '✓ defeated' : isUnlocked ? 'unlocked' : `locked @ ${b.unlockAfterFights}f`}`}
                onPress={() => setSelectedId(b.id)}
              />
            );
          })}
        </AppCard>

        <AppCard>
          <AppText style={styles.section}>{boss.nickname}</AppText>
          <AppText style={styles.line}>{boss.signature}</AppText>
          <AppText style={styles.line}>{`Tier: ${boss.tier}  •  Stat mult: +${(boss.statMultiplier * 100).toFixed(0)}%  •  Legendary floor: ${boss.legendaryFloor}`}</AppText>
          <AppText style={styles.line}>{`Status: ${defeated ? 'DEFEATED' : unlocked ? 'available' : `locked (need ${boss.unlockAfterFights} fights)`}`}</AppText>
        </AppCard>

        <OpponentPreview opponent={opponent} label="Boss preview" />

        <View style={styles.actions}>
          <AppButton label={busy ? 'Fighting…' : 'Fight Boss'} onPress={() => onFight()} disabled={busy} />
          <AppButton label="Force Win" onPress={() => onFight(true)} disabled={busy} />
          <AppButton label="Force Loss" onPress={() => onFight(false)} disabled={busy} />
        </View>

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
