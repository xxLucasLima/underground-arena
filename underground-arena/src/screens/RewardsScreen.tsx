import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton, AppCard, AppText, ScreenContainer, ScreenHeader } from '@/components/base';
import { LevelUpBanner, RarityReveal, RewardPopup, XpBar } from '@/components/rewards';
import { CARD_DEFINITIONS } from '@/data/cards';
import { useProgressionStore } from '@/stores/progressionStore';
import type { PostFightSummary } from '@/services/progression/postFight';
import { theme } from '@/themes';
import { motion } from '@/themes/motion';
import { audio } from '@/services/juice/audio';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Rewards'>;

/**
 * Post-fight reward summary, choreographed in three beats:
 *   1. outcome banner (won/lost)
 *   2. staggered reward popups (XP, coins, drops)
 *   3. level-up banner (if any), then card reveals
 *
 * The summary is passed via navigation params — the screen itself is a pure
 * presentation layer. If summary is missing (e.g. cold-loaded), the screen
 * shows a graceful fallback.
 */
export function RewardsScreen({ route, navigation }: Props) {
  const summary = (route.params as unknown as { summary?: PostFightSummary } | undefined)?.summary;
  const level = useProgressionStore((s) => s.level);
  const xp = useProgressionStore((s) => s.xp);
  const [revealCards, setRevealCards] = useState(false);

  useEffect(() => {
    audio.play('reward');
    // After all the reward popups finish, reveal the cards.
    const t = setTimeout(() => setRevealCards(true), motion.duration.hero);
    return () => clearTimeout(t);
  }, []);

  if (!summary) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Rewards" />
        <AppText tone="muted">No fight summary available.</AppText>
        <View style={{ height: theme.spacing.lg }} />
        <AppButton label="Back to Main Menu" onPress={() => navigation.navigate('MainMenu')} />
      </ScreenContainer>
    );
  }

  const droppedCards = summary.unlockedCardIds
    .map((id) => CARD_DEFINITIONS.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={summary.won ? 'Victory' : 'Defeat'}
          subtitle={summary.winnerId ? `Winner: ${summary.winnerId}` : 'Draw'}
        />

        <AppCard variant={summary.won ? 'highlight' : 'danger'} padding="lg">
          <AppText size="caption" tone="muted" uppercase>
            Match Result
          </AppText>
          <AppText size="title" weight="black" style={{ color: summary.won ? theme.colors.gold : theme.colors.primaryGlow }}>
            {summary.won ? '★ Victorious ★' : 'Down but not out.'}
          </AppText>
          <AppText size="caption" tone="muted">{`Lasted ${summary.turns} turns.`}</AppText>
        </AppCard>

        <View style={styles.rewards}>
          <RewardPopup glyph="✨" label="XP Earned" value={`+${summary.rewards.xp}`} tint={theme.colors.gold} delay={0} />
          <RewardPopup glyph="🪙" label="Coins" value={`+${summary.rewards.coins}`} tint={theme.colors.gold} delay={120} />
          {summary.rewards.cardDrops.length > 0 ? (
            <RewardPopup
              glyph="🃏"
              label="Card Drops"
              value={`${summary.rewards.cardDrops.length} new`}
              tint={theme.colors.neon}
              delay={240}
            />
          ) : null}
          {summary.newAchievements.length > 0 ? (
            <RewardPopup
              glyph="🏆"
              label="Achievements"
              value={`${summary.newAchievements.length} unlocked`}
              tint={theme.colors.orange}
              delay={360}
            />
          ) : null}
        </View>

        <AppCard variant="elevated" padding="md">
          <XpBar level={level} xp={xp} />
        </AppCard>

        <LevelUpBanner
          visible={summary.levelsGained > 0}
          fromLevel={summary.before.level}
          toLevel={summary.after.level}
        />

        {revealCards && droppedCards.length > 0 ? (
          <View style={styles.cardList}>
            <AppText size="caption" tone="muted" uppercase>
              New cards
            </AppText>
            {droppedCards.map((c, i) => (
              <RarityReveal key={c.id} card={c} visible delay={i * 180} />
            ))}
          </View>
        ) : null}

        <View style={styles.actions}>
          <AppButton label="Continue" onPress={() => navigation.navigate('MainMenu')} />
          <AppButton label="Fight again" variant="secondary" onPress={() => navigation.replace('Fight')} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.spacing.md, paddingBottom: theme.spacing.huge },
  rewards: { gap: theme.spacing.sm },
  cardList: { gap: theme.spacing.sm, marginTop: theme.spacing.md },
  actions: { gap: theme.spacing.sm, marginTop: theme.spacing.lg },
});
