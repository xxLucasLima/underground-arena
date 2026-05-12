import { Animated, StyleSheet, View } from 'react-native';
import { AppCard, AppText, ProgressBar } from '@/components/base';
import { theme } from '@/themes';
import { StatusChip } from './StatusChip';
import type { ActiveStatusEffect, FighterProfile, FighterRuntime } from '@/engine/combat/types';
import { usePunch } from '@/animations/hooks/usePunch';
import { useShake } from '@/animations/hooks/useShake';
import { useEffect, useImperativeHandle, forwardRef } from 'react';

export type FighterPanelHandle = {
  /** Trigger a hit reaction (punch + small shake). */
  hit: (impact: 'light' | 'medium' | 'heavy' | 'critical') => void;
};

type Props = {
  profile: FighterProfile;
  /**
   * Live runtime values to display. May be momentarily `undefined` during the
   * first render before playback's first `onState` fires — we render the
   * profile defaults in that case instead of crashing.
   */
  runtime?: FighterRuntime;
  /** Reverse layout for opponent (avatar on right). */
  mirrored?: boolean;
  /** Visual emphasis (active turn). */
  active?: boolean;
};

const IMPACT_TO_PUNCH = { light: 1.04, medium: 1.08, heavy: 1.14, critical: 1.18 } as const;
const IMPACT_TO_SHAKE = { light: 2, medium: 4, heavy: 8, critical: 12 } as const;

/**
 * Composite fighter HUD. Owns its own punch/shake reactions, exposes an
 * imperative `hit()` so the Fight screen drives it from a feedback listener.
 */
export const FighterPanel = forwardRef<FighterPanelHandle, Props>(function FighterPanel(
  { profile, runtime, mirrored, active },
  ref,
) {
  const { scale, trigger: punch } = usePunch();
  const { translateX, trigger: shake } = useShake();

  // Defensive defaults so the panel always renders even before the first
  // playback snapshot arrives (or if a state stream drops a fighter).
  const hp = runtime?.hp ?? profile.maxHp;
  const stamina = runtime?.stamina ?? profile.maxStamina;
  const effects: ActiveStatusEffect[] = runtime?.effects ?? [];
  const defeated = runtime?.defeated ?? false;

  useImperativeHandle(ref, () => ({
    hit: (impact) => {
      punch(IMPACT_TO_PUNCH[impact]);
      shake(IMPACT_TO_SHAKE[impact]);
    },
  }));

  useEffect(() => {
    if (defeated) {
      // soft pulse-down on defeat
      shake(2);
    }
  }, [defeated, shake]);

  const hpProgress = profile.maxHp > 0 ? hp / profile.maxHp : 0;
  const staProgress = profile.maxStamina > 0 ? stamina / profile.maxStamina : 0;

  return (
    <Animated.View style={{ transform: [{ scale }, { translateX }] }}>
      <AppCard variant={active ? 'hero' : 'elevated'} padding="md">
        <View style={[styles.header, mirrored && styles.headerMirrored]}>
          <View style={[styles.avatar, defeated && styles.avatarKO]}>
            <AppText size="title" weight="black">
              {profile.name.charAt(0)}
            </AppText>
          </View>
          <View style={[styles.identity, mirrored && styles.identityRight]}>
            <AppText size="subtitle" weight="black" numberOfLines={1}>
              {profile.name}
            </AppText>
            <AppText size="caption" tone="muted" uppercase>
              {profile.personality}
            </AppText>
          </View>
        </View>

        <View style={styles.bars}>
          <View style={styles.barRow}>
            <AppText size="micro" tone="muted" uppercase>
              HP
            </AppText>
            <AppText size="micro" tone="muted">{`${Math.max(0, Math.round(hp))} / ${profile.maxHp}`}</AppText>
          </View>
          <ProgressBar
            progress={hpProgress}
            color={theme.colors.primary}
            trailColor={'#3A0E14'}
            height={10}
          />

          <View style={styles.barRow}>
            <AppText size="micro" tone="muted" uppercase>
              Stamina
            </AppText>
            <AppText size="micro" tone="muted">{`${Math.round(stamina)} / ${profile.maxStamina}`}</AppText>
          </View>
          <ProgressBar
            progress={staProgress}
            color={theme.colors.gold}
            trailColor={'#2C2410'}
            height={6}
          />
        </View>

        {effects.length > 0 ? (
          <View style={styles.effects}>
            {effects.map((e, i) => (
              <StatusChip key={`${e.type}-${i}`} status={e.type} />
            ))}
          </View>
        ) : null}
      </AppCard>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  headerMirrored: { flexDirection: 'row-reverse' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  avatarKO: { borderColor: theme.colors.danger, opacity: 0.4 },
  identity: { flex: 1 },
  identityRight: { alignItems: 'flex-end' },
  bars: { gap: 4 },
  barRow: { flexDirection: 'row', justifyContent: 'space-between' },
  effects: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: theme.spacing.sm },
});
