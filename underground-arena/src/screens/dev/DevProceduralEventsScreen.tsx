import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppText, ScreenHeader } from '@/components/base';
import {
  EVENT_TRIGGER_CHANCE,
  PROCEDURAL_EVENTS,
  type ProceduralEvent,
} from '@/data/modes/proceduralEvents';
import { rollProceduralEvent } from '@/services/modes/proceduralEvents';
import { createRng } from '@/engine/combat/rng';
import { theme } from '@/themes';

/**
 * Procedural event dev view: explains the trigger chance, shows every
 * defined event with weights and modifiers, and lets the user roll many
 * seeds at once to verify distribution.
 */
export function DevProceduralEventsScreen() {
  const [seed, setSeed] = useState(1);
  const [rolls, setRolls] = useState(50);

  const distribution = useMemo(() => {
    const counts: Record<string, number> = { __none__: 0 };
    PROCEDURAL_EVENTS.forEach((e) => {
      counts[e.id] = 0;
    });
    for (let i = 0; i < rolls; i += 1) {
      const rng = createRng((seed + i) ^ 0xa5a5);
      const ev = rollProceduralEvent(rng);
      if (!ev) counts.__none__ += 1;
      else counts[ev.id] = (counts[ev.id] ?? 0) + 1;
    }
    return counts;
  }, [seed, rolls]);

  const single: ProceduralEvent | null = useMemo(
    () => rollProceduralEvent(createRng(seed ^ 0xa5a5)),
    [seed],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Procedural Events (dev)" />

        <AppCard>
          <AppText style={styles.section}>Config</AppText>
          <AppText style={styles.line}>{`Trigger chance: ${(EVENT_TRIGGER_CHANCE * 100).toFixed(1)}%`}</AppText>
          <AppText style={styles.line}>{`Seed: ${seed}`}</AppText>
          <AppText style={styles.line}>{`Rolls: ${rolls}`}</AppText>
          <View style={styles.row}>
            <AppButton label="Seed +1" onPress={() => setSeed((s) => s + 1)} />
            <AppButton label="Seed +100" onPress={() => setSeed((s) => s + 100)} />
            <AppButton label="Rolls ×2" onPress={() => setRolls((r) => Math.min(r * 2, 10000))} />
            <AppButton label="Rolls /2" onPress={() => setRolls((r) => Math.max(Math.floor(r / 2), 1))} />
          </View>
        </AppCard>

        <AppCard>
          <AppText style={styles.section}>Single roll @ current seed</AppText>
          <AppText style={styles.line}>{single ? `${single.id} — ${single.name}` : 'no event'}</AppText>
          {single ? <AppText style={styles.line}>{single.description}</AppText> : null}
        </AppCard>

        <AppCard>
          <AppText style={styles.section}>Empirical distribution</AppText>
          <AppText style={styles.line}>{`No event: ${distribution.__none__} (${((distribution.__none__ / rolls) * 100).toFixed(1)}%)`}</AppText>
          {PROCEDURAL_EVENTS.map((e) => (
            <AppText key={e.id} style={styles.line}>
              {`${e.id}  •  weight ${e.weight}  •  hits ${distribution[e.id] ?? 0} (${(((distribution[e.id] ?? 0) / rolls) * 100).toFixed(1)}%)`}
            </AppText>
          ))}
        </AppCard>

        <AppCard>
          <AppText style={styles.section}>Catalog</AppText>
          {PROCEDURAL_EVENTS.map((e) => (
            <View key={e.id} style={styles.eventBlock}>
              <AppText style={styles.eventName}>{`${e.name} (${e.id})`}</AppText>
              <AppText style={styles.line}>{e.description}</AppText>
              <AppText style={styles.line}>
                {`Reward mods → ${e.rewardMods ? JSON.stringify(e.rewardMods) : 'none'}`}
              </AppText>
            </View>
          ))}
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
  eventBlock: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#222' },
  eventName: { fontWeight: '700', fontSize: 13 },
});
