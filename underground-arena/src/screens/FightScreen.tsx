import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton, AppText, ScreenContainer } from '@/components/base';
import {
  ComboCounter,
  DefenseBadge,
  FighterPanel,
  type FighterPanelHandle,
  HitFlash,
  type HitFlashHandle,
  KOOverlay,
  MoveBanner,
  StatusToast,
  useFloatingNumberLayer,
} from '@/components/combat';
import { runMatch } from '@/engine/combat';
import { MOCK_OPPONENT, MOCK_PLAYER } from '@/engine/combat/mockFighters';
import type { CombatState } from '@/engine/combat/types';
import { feedbackBus } from '@/feedback/feedbackBus';
import { startPlayback } from '@/services/combat/combatPlayer';
import { haptics } from '@/services/juice/haptics';
import { audio } from '@/services/juice/audio';
import { useShake } from '@/animations/hooks/useShake';
import { processFightResult, type PostFightSummary } from '@/services/progression/postFight';
import { theme } from '@/themes';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Fight'>;

/**
 * Polished Fight screen.
 *
 * Architecture:
 *  - Runs the entire match deterministically via `runMatch`.
 *  - Drives playback through `startPlayback`, which emits `FeedbackCue`s.
 *  - Subscribes once to `feedbackBus` and dispatches each cue to:
 *      • the right FighterPanel ref (punch+shake),
 *      • HitFlash (full-screen flash),
 *      • FloatingNumber layer (damage popups),
 *      • haptics + audio (settings-aware),
 *      • setState for HUD bits (HP, combo, KO overlay).
 *
 * Performance: feedback consumers use imperative handles, so per-hit reactions
 * don't trigger React re-renders. Only HP/stamina snapshots and combo count
 * cause renders, and those run at most ~3-4Hz during a fight.
 */
export function FightScreen({ navigation }: Props) {
  const seed = useMemo(() => Math.floor(Math.random() * 1e6), []);

  // Resolve the match up-front; playback is purely cosmetic.
  const finalState = useMemo(
    () => runMatch({ seed, playerProfile: MOCK_PLAYER, opponentProfile: MOCK_OPPONENT }),
    [seed],
  );

  const [snapshot, setSnapshot] = useState<CombatState>(finalState);
  const [combo, setCombo] = useState(0);
  const [showKO, setShowKO] = useState<null | 'KO' | 'Submission' | 'Defeat' | 'Draw'>(null);
  const [summary, setSummary] = useState<PostFightSummary | null>(null);

  const playerPanelRef = useRef<FighterPanelHandle>(null);
  const opponentPanelRef = useRef<FighterPanelHandle>(null);
  const hitFlashRef = useRef<HitFlashHandle>(null);
  const { layer: floaters, spawn: spawnFloater } = useFloatingNumberLayer();
  const screenShake = useShake();

  // Subscribe to feedbackBus and dispatch.
  useEffect(() => {
    const off = feedbackBus.on((cue) => {
      switch (cue.kind) {
        case 'hit': {
          const ref = cue.target === 'player' ? playerPanelRef : opponentPanelRef;
          ref.current?.hit(cue.impact);
          hitFlashRef.current?.flash(cue.impact);
          screenShake.trigger(cue.impact === 'critical' ? 12 : cue.impact === 'heavy' ? 8 : cue.impact === 'medium' ? 4 : 2);
          spawnFloater(cue.damage, { critical: !!cue.critical });
          haptics.impact(cue.impact === 'critical' || cue.impact === 'heavy' ? 'heavy' : cue.impact);
          audio.play(
            cue.impact === 'critical' ? 'critical' : cue.impact === 'heavy' ? 'hit-heavy' : cue.impact === 'medium' ? 'hit-medium' : 'hit-light',
          );
          break;
        }
        case 'critical':
          // The hit cue (escalated) handles visuals; this cue is for audio-emphasis only.
          audio.play('critical');
          break;
        case 'move': {
          // Add a *subtle* screen pulse on Epic/Legendary card plays so the
          // banner entrance has physical weight. Damage/hit shakes are handled
          // separately by the 'hit' branch — these two never collide in time
          // because cardPlayed precedes damageDealt in the event log.
          if (cue.rarity === 'Legendary') {
            screenShake.trigger(10);
          } else if (cue.rarity === 'Epic') {
            screenShake.trigger(5);
          }
          // Ultimates (any rarity, but typically Legendary) get an extra punch.
          if (cue.isUltimate) {
            hitFlashRef.current?.flash('heavy');
          }
          break;
        }
        case 'combo':
          setCombo(cue.count);
          audio.play('combo');
          haptics.impact('light');
          break;
        case 'counter':
          audio.play('counter');
          haptics.impact('medium');
          break;
        case 'stagger':
          haptics.impact('light');
          break;
        case 'ko':
          audio.play('ko');
          haptics.notify('success');
          screenShake.trigger(16);
          break;
        case 'submission':
          audio.play('submission');
          haptics.notify('success');
          break;
        case 'matchEnd':
          // Outcome resolution handled in onDone below — using snapshot.winnerId.
          break;
        default:
          break;
      }
    });
    return off;
  }, [screenShake, spawnFloater]);

  // Start playback once on mount.
  useEffect(() => {
    const handle = startPlayback({
      state: finalState,
      events: finalState.log,
      playerId: MOCK_PLAYER.id,
      onState: (s) => setSnapshot(s),
      onDone: async () => {
        // Determine cinematic outcome
        const won = finalState.winnerId === MOCK_PLAYER.id;
        const loserId = won ? MOCK_OPPONENT.id : MOCK_PLAYER.id;
        const finisher = finalState.fighters[loserId]?.finisher ?? null;
        const outcome: 'KO' | 'Submission' | 'Defeat' | 'Draw' = !finalState.winnerId
          ? 'Draw'
          : won
          ? finisher === 'Submission'
            ? 'Submission'
            : 'KO'
          : 'Defeat';
        setShowKO(outcome);

        // Kick off reward processing in parallel so the Rewards screen is ready.
        try {
          const result = await processFightResult({ state: finalState, playerId: MOCK_PLAYER.id, seed });
          setSummary(result);
        } catch {
          /* ignore */
        }
      },
    });
    return () => handle.cancel();
  }, [finalState, seed]);

  const playerRuntime = snapshot.fighters[MOCK_PLAYER.id];
  const opponentRuntime = snapshot.fighters[MOCK_OPPONENT.id];

  const goRewards = () => {
    navigation.replace('Rewards', { summary } as never);
  };

  return (
    <ScreenContainer bleed noAnimation>
      <Animated.View style={[styles.root, { transform: [{ translateX: screenShake.translateX }] }]}>
        <View style={styles.header}>
          <AppText size="caption" tone="muted" uppercase>
            {`Round ${Math.max(1, Math.ceil(snapshot.turn / 3))}  •  Turn ${snapshot.turn}`}
          </AppText>
        </View>

        <View style={styles.opponentRow}>
          <FighterPanel
            ref={opponentPanelRef}
            profile={MOCK_OPPONENT}
            runtime={opponentRuntime}
            mirrored
            active={snapshot.activeFighterId === MOCK_OPPONENT.id}
          />
        </View>

        <View style={styles.center}>
          <ComboCounter count={combo} />
        </View>

        <View style={styles.playerRow}>
          <FighterPanel
            ref={playerPanelRef}
            profile={MOCK_PLAYER}
            runtime={playerRuntime}
            active={snapshot.activeFighterId === MOCK_PLAYER.id}
          />
        </View>

        {floaters}
        <HitFlash ref={hitFlashRef} />
        {/*
          Presentation layer overlays. Order matters:
            - StatusToast is a stack near the top → renders behind MoveBanner.
            - MoveBanner is the centered headline → renders above StatusToast.
            - KOOverlay is the cinematic finale → renders above everything.
          All three are self-subscribed to the feedbackBus and pointerEvents=none.
        */}
        <StatusToast />
        <MoveBanner />
        {/*
          Defensive outcomes badge MUST render *after* (above) MoveBanner.
          MoveBanner is a fullscreen pointerEvents=none overlay whose own
          banner is centered, so layering DefenseBadge on top lets it stay
          visible at the defender's row even while the banner is on screen.
          DefenseBadge itself is anchored top/bottom (~14% / 12%), outside
          the banner's center band — so they don't overlap.
        */}
        <DefenseBadge />
        <KOOverlay
          visible={showKO !== null}
          outcome={showKO ?? 'Draw'}
          onDone={() => {
            // Slight hold; nav to Rewards once finisher banner has settled.
            setTimeout(goRewards, 400);
          }}
        />
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: theme.spacing.lg, justifyContent: 'space-between' },
  header: { alignItems: 'center', marginBottom: theme.spacing.sm },
  opponentRow: { width: '100%' },
  playerRow: { width: '100%' },
  center: { alignItems: 'center', justifyContent: 'center', minHeight: 60 },
});
