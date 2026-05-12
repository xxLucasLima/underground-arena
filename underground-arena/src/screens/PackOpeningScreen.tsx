import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, ScreenContainer, ScreenHeader } from '@/components/base';
import { CardTile } from '@/components/cards';
import type { RootStackParamList } from '@/types/navigation';
import { useCardsStore } from '@/stores/cardsStore';

type Props = NativeStackScreenProps<RootStackParamList, 'PackOpening'>;

export function PackOpeningScreen({ route }: Props) {
  const packType = route.params?.packType ?? 'Bronze';
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const openPackAndCollect = useCardsStore((s) => s.openPackAndCollect);
  const cards = useCardsStore((s) => s.cards);
  const owned = useCardsStore((s) => s.owned);

  const revealedCards = useMemo(
    () => revealedIds.map((id) => cards.find((c) => c.id === id)).filter(Boolean),
    [revealedIds, cards],
  );

  const onOpen = async () => {
    const ids = await openPackAndCollect(packType);
    setRevealedIds(ids);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title={`${packType} Pack Opening`} />
      <View style={styles.hero}>
        <AppText style={styles.big}>🎁</AppText>
        <AppText>Tap to reveal your cards</AppText>
        <AppButton label={`Open ${packType} Pack`} onPress={() => void onOpen()} />
      </View>
      <View style={styles.revealList}>
        {revealedCards.map((card, idx) =>
          card ? <CardTile key={`${card.id}-${idx}`} card={card} owned={owned[card.id]} /> : null,
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 10, marginBottom: 16 },
  big: { fontSize: 42 },
  revealList: { gap: 12 },
});
