import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton, AppText, ScreenContainer, ScreenHeader } from '@/components/base';
import { CardTile } from '@/components/cards';
import { useCardsStore } from '@/stores/cardsStore';
import { applyCardFilters, applyCardSort } from '@/services/cards/cardUtils';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CardCollection'>;

export function CardCollectionScreen({ navigation }: Props) {
  const allCards = useCardsStore((s) => s.cards);
  const owned = useCardsStore((s) => s.owned);
  const filter = useCardsStore((s) => s.filter);
  const sort = useCardsStore((s) => s.sort);
  const setSort = useCardsStore((s) => s.setSort);
  const setFilter = useCardsStore((s) => s.setFilter);
  const cards = useMemo(
    () => applyCardSort(applyCardFilters(allCards, owned, filter), owned, sort),
    [allCards, owned, filter, sort],
  );
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [rarity, setRarity] = useState<'All' | 'Common' | 'Rare' | 'Epic' | 'Legendary'>('All');

  const ownedCount = useMemo(() => Object.keys(owned).length, [owned]);

  const applyFilters = (next: { favoritesOnly?: boolean; ownedOnly?: boolean; rarity?: typeof rarity }) => {
    const fav = next.favoritesOnly ?? favoritesOnly;
    const own = next.ownedOnly ?? ownedOnly;
    const rar = next.rarity ?? rarity;
    setFavoritesOnly(fav);
    setOwnedOnly(own);
    setRarity(rar);
    setFilter({ favoritesOnly: fav, ownedOnly: own, rarity: rar === 'All' ? undefined : rar });
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Card Collection" />
      <View style={styles.controls}>
        <AppButton label="Sort: Strongest" onPress={() => setSort('strongest')} />
        <AppButton label="Open Pack" onPress={() => navigation.navigate('PackOpening', { packType: 'Bronze' })} />
        <AppButton
          label={favoritesOnly ? 'Favorites: ON' : 'Favorites: OFF'}
          onPress={() => applyFilters({ favoritesOnly: !favoritesOnly })}
        />
        <AppButton label={ownedOnly ? 'Owned Only: ON' : 'Owned Only: OFF'} onPress={() => applyFilters({ ownedOnly: !ownedOnly })} />
        <AppButton
          label={`Rarity: ${rarity}`}
          onPress={() => {
            const order: Array<typeof rarity> = ['All', 'Common', 'Rare', 'Epic', 'Legendary'];
            const next = order[(order.indexOf(rarity) + 1) % order.length];
            applyFilters({ rarity: next });
          }}
        />
      </View>
      <AppText>{`Owned ${ownedCount}/${cards.length}`}</AppText>
      <ScrollView contentContainerStyle={styles.list}>
        {cards.map((card) => (
          <CardTile
            key={card.id}
            card={card}
            owned={owned[card.id]}
            onPress={() => navigation.navigate('CardDetails', { cardId: card.id })}
          />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  controls: { gap: 8, marginBottom: 12 },
  list: { gap: 12, paddingBottom: 80 },
});



