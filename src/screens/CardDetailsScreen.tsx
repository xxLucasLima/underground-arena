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
});
