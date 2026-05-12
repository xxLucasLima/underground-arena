import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AnimatedPanel,
  AppButton,
  AppCard,
  AppText,
  CurrencyDisplay,
  EnergyBar,
  ScreenContainer,
} from '@/components/base';
import { XpBar } from '@/components/rewards';
import { useProgressionStore } from '@/stores/progressionStore';
import { theme } from '@/themes';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'MainMenu'>;

/**
 * Underground Arena entry hub.
 *
 * The screen is a composition of polished building blocks (no inline styles
 * for visual hierarchy). Every nav button uses `AppButton` so micro-interactions
 * are uniform; surfaces use `AppCard` variants so we get consistent shadows
 * and accents.
 */
export function MainMenuScreen({ navigation }: Props) {
  const level = useProgressionStore((s) => s.level);
  const xp = useProgressionStore((s) => s.xp);
  const coins = useProgressionStore((s) => s.currencies.coins);
  const gems = useProgressionStore((s) => s.currencies.gems);
  const energy = useProgressionStore((s) => s.energy);
  const streak = useProgressionStore((s) => s.streak);

  return (
    <ScreenContainer>
      <AnimatedPanel>
        <AppCard variant="hero" padding="lg">
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <AppText size="caption" tone="muted" uppercase>
                Underground Arena
              </AppText>
              <AppText size="display" weight="black">
                {`Lv ${level}`}
              </AppText>
              <AppText size="caption" tone="muted">
                {`Win streak: ${streak}`}
              </AppText>
            </View>
            <CurrencyDisplay coins={coins} gems={gems} />
          </View>
          <View style={{ height: theme.spacing.md }} />
          <XpBar level={level} xp={xp} />
          <View style={{ height: theme.spacing.sm }} />
          <EnergyBar current={energy.current} max={energy.max} />
        </AppCard>
      </AnimatedPanel>

      <AnimatedPanel delay={80}>
        <View style={styles.primaryActions}>
          <AppButton label="Quick Fight" size="lg" onPress={() => navigation.navigate('Fight')} />
          <AppButton
            label="Encounter Hub"
            variant="secondary"
            onPress={() => navigation.navigate('EncounterHub')}
          />
        </View>
      </AnimatedPanel>

      <AnimatedPanel delay={160}>
        <View style={styles.gridRow}>
          <NavTile label="Collection" onPress={() => navigation.navigate('CardCollection')} />
          <NavTile label="Deck Builder" onPress={() => navigation.navigate('DeckBuilder')} />
        </View>
        <View style={styles.gridRow}>
          <NavTile label="Pack Opening" onPress={() => navigation.navigate('PackOpening')} />
          <NavTile label="Training Gym" onPress={() => navigation.navigate('TrainingGym')} />
        </View>
        <View style={styles.gridRow}>
          <NavTile label="Combat Debug" onPress={() => navigation.navigate('CombatDebug')} />
          <NavTile label="Settings" onPress={() => navigation.navigate('Settings')} />
        </View>
      </AnimatedPanel>
    </ScreenContainer>
  );
}

function NavTile({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <View style={{ flex: 1 }}>
      <AppButton label={label} variant="secondary" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  primaryActions: { gap: theme.spacing.sm, marginTop: theme.spacing.lg },
  gridRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
});
