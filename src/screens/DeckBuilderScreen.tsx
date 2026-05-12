import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppButton, AppText, ScreenContainer, ScreenHeader } from '@/components/base';
import { CardTile } from '@/components/cards';
import { useCardsStore } from '@/stores/cardsStore';

export function DeckBuilderScreen() {
  const cards = useCardsStore((s) => s.cards);
  const owned = useCardsStore((s) => s.owned);
  const decks = useCardsStore((s) => s.decks);
  const saveDeck = useCardsStore((s) => s.saveDeck);
  const [selected, setSelected] = useState<string[]>(decks[0]?.cardIds ?? []);
  const [message, setMessage] = useState<string>('');

  const ownedCards = useMemo(() => cards.filter((c) => owned[c.id]), [cards, owned]);

  const toggleCard = (cardId: string) => {
    setSelected((prev) => (prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]));
  };

  const onSave = async () => {
    const result = await saveDeck({ id: 'deck-1', name: 'Deck 1', cardIds: selected, updatedAt: Date.now() });
    setMessage(result.ok ? 'Deck saved!' : `Invalid: ${result.reason}`);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Deck Builder" />
      <AppText>{`Selected ${selected.length}/8`}</AppText>
      <AppButton label="Save Deck" onPress={() => void onSave()} />
      {message ? <AppText>{message}</AppText> : null}
      <ScrollView contentContainerStyle={styles.list}>
        {ownedCards.map((card) => (
          <View key={card.id} style={selected.includes(card.id) ? styles.selected : undefined}>
            <CardTile card={card} owned={owned[card.id]} onPress={() => toggleCard(card.id)} />
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12, paddingTop: 12, paddingBottom: 80 },
  selected: { borderWidth: 1, borderColor: '#FFB547', borderRadius: 12 },
});
