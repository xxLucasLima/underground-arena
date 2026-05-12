import { ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppText, ScreenHeader } from '@/components/base';
import { useEncounterStore } from '@/stores/encounterStore';
import { useProgressionStore } from '@/stores/progressionStore';
import type { RootStackParamList } from '@/types/navigation';
import { theme } from '@/themes';

type Props = NativeStackScreenProps<RootStackParamList, 'EncounterHub'>;

/**
 * Central dev menu for Phase-05 encounter systems. Each entry pushes a
 * specialized debug screen. This screen is intentionally raw — it exists so
 * gameplay/balance can be validated before the polished UI phase.
 */
export function EncounterHubScreen({ navigation }: Props) {
  const level = useProgressionStore((s) => s.level);
  const league = useProgressionStore((s) => s.league);
  const coins = useProgressionStore((s) => s.currencies.coins);
  const xp = useProgressionStore((s) => s.xp);
  const tournament = useEncounterStore((s) => s.tournament);
  const survival = useEncounterStore((s) => s.survival);
  const rivals = useEncounterStore((s) => s.rivals);
  const dailyDate = useEncounterStore((s) => s.daily?.date ?? '—');
  const history = useEncounterStore((s) => s.history);
  const bossVictories = useEncounterStore((s) => s.bossVictories);
  const resetEncounters = useEncounterStore((s) => s.reset);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Encounter Hub (dev)" />

        <AppCard>
          <AppText style={styles.section}>Player Snapshot</AppText>
          <AppText style={styles.line}>{`Level ${level}  •  XP ${xp}  •  Coins ${coins}`}</AppText>
          <AppText style={styles.line}>{`League: ${league}`}</AppText>
        </AppCard>

        <AppCard>
          <AppText style={styles.section}>Encounter State</AppText>
          <AppText style={styles.line}>{`Tournament: ${tournament ? `${tournament.templateId} (round ${tournament.currentRound})` : 'none'}`}</AppText>
          <AppText style={styles.line}>{`Survival: ${survival ? `streak ${survival.streak}` : 'none'}`}</AppText>
          <AppText style={styles.line}>{`Rivals: ${rivals.length}`}</AppText>
          <AppText style={styles.line}>{`Daily set: ${dailyDate}`}</AppText>
          <AppText style={styles.line}>{`Opponent history: ${history.length} entries`}</AppText>
          <AppText style={styles.line}>{`Bosses defeated: ${bossVictories.length}`}</AppText>
        </AppCard>

        <AppCard>
          <AppText style={styles.section}>Modes</AppText>
          <AppButton label="Matchmaking" onPress={() => navigation.navigate('DevMatchmaking')} />
          <AppButton label="Tournaments" onPress={() => navigation.navigate('DevTournaments')} />
          <AppButton label="Survival Mode" onPress={() => navigation.navigate('DevSurvival')} />
          <AppButton label="Rivals" onPress={() => navigation.navigate('DevRivals')} />
          <AppButton label="Bosses" onPress={() => navigation.navigate('DevBosses')} />
          <AppButton label="Daily Challenges" onPress={() => navigation.navigate('DevDailyChallenges')} />
          <AppButton label="Procedural Events" onPress={() => navigation.navigate('DevProceduralEvents')} />
        </AppCard>

        <AppCard>
          <AppText style={styles.section}>Other</AppText>
          <AppButton label="Original Combat Debug" onPress={() => navigation.navigate('CombatDebug')} />
          <AppButton
            label="Reset Encounter State"
            onPress={() => {
              void resetEncounters();
            }}
          />
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: 12, paddingBottom: 80 },
  section: { fontWeight: '800', fontSize: 14, marginBottom: 6 },
  line: { fontSize: 12, marginTop: 2 },
});
