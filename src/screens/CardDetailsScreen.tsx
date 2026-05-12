import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, ScreenContainer, ScreenHeader } from '@/components/base';
import type { RootStackParamList } from '@/types/navigation';
import { useCardsStore } from '@/stores/cardsStore';

type Props = NativeStackScreenProps<RootStackParamList, 'CardDetails'>;

export function CardDetailsScreen({ route }: Props) {
  const { cardId } = route.params;
  const card = useCardsStore((s) => s.cards.find((c) => c.id === cardId));
  const owned = useCardsStore((s) => s.owned[cardId]);
  const visibility = useCardsStore((s) => s.getVisibility(cardId));
  const toggleFavorite = useCardsStore((s) => s.toggleFavorite);
  const getUpgradeCost = useCardsStore((s) => s.getUpgradeCost);

  if (!card) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Card Details" />
        <AppText>Card not found.</AppText>
      </ScreenContainer>
    );
  }

  if (visibility === 'unseen') {
    return (
      <ScreenContainer>
        <ScreenHeader title="Unknown Card" />
        <AppText style={styles.dim}>This card hasn’t been discovered yet.</AppText>
        <AppText style={styles.dim}>Keep fighting, opening packs, and completing achievements to find it.</AppText>
      </ScreenContainer>
    );
  }

  if (visibility === 'discovered') {
    return (
      <ScreenContainer>
        <ScreenHeader title={card.name} />
        <View style={styles.block}>
          <AppText>{`Category: ${card.category}`}</AppText>
          <AppText>{`Rarity: ${card.rarity}`}</AppText>
          <AppText style={styles.dim}>Stats hidden until you collect this card.</AppText>
        </View>
        <View style={styles.block}>
          <AppText style={styles.dim}>Sources: Packs, post-fight rewards, achievements.</AppText>
        </View>
      </ScreenContainer>
    );
  }

  const cost = getUpgradeCost(cardId);

  return (
    <ScreenContainer>
      <ScreenHeader title={card.name} />
      <View style={styles.block}>
        <AppText>{card.description}</AppText>
        <AppText>{`Category: ${card.category}`}</AppText>
        <AppText>{`Rarity: ${card.rarity}`}</AppText>
        <AppText>{`DMG ${card.damage} • STA ${card.staminaCost} • CD ${card.cooldown}`}</AppText>
        <AppText>{`Owned: ${owned?.quantity ?? 0} • Level: ${owned?.level ?? 0}`}</AppText>
      </View>
      <View style={styles.block}>
        <AppText>{`Upgrade Cost (scaffold): ${cost.coins} coins + ${cost.duplicates} duplicates`}</AppText>
        <AppButton
          label={owned?.favorite ? 'Unfavorite' : 'Favorite'}
          onPress={() => void toggleFavorite(cardId)}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  block: { gap: 8, marginBottom: 16 },
  dim: { opacity: 0.7 },
});
