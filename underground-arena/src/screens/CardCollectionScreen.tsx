import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton, AppText, ScreenContainer, ScreenHeader } from '@/components/base';
import { CardTile } from '@/components/cards';
import { useCardsStore } from '@/stores/cardsStore';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CardCollection'>;

export function CardCollectionScreen({ navigation }: Props) {
  // Pull visibility-aware projection straight from the store.
  const owned = useCardsStore((s) => s.owned);
  const discovery = useCardsStore((s) => s.discovery);
  const filter = useCardsStore((s) => s.filter);
  const sort = useCardsStore((s) => s.sort);
  const setSort = useCardsStore((s) => s.setSort);
  const setFilter = useCardsStore((s) => s.setFilter);
  const cards = useCardsStore((s) => s.cards);
  const getVisibleCards = useCardsStore((s) => s.getVisibleCards);

  // Recompute when any of the underlying inputs change.
  // (getVisibleCards reads current state via get(); we trigger by deps.)
  const visible = useMemo(
    () => getVisibleCards(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cards, owned, discovery, filter, sort],
  );

  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [hideUnseen, setHideUnseen] = useState(true);
  const [rarity, setRarity] = useState<'All' | 'Common' | 'Rare' | 'Epic' | 'Legendary'>('All');

  const totals = useMemo(() => {
    let ownedC = 0;
    let discoveredC = 0;
    let unseenC = 0;
    for (const v of visible) {
      if (v.visibility === 'owned') ownedC += 1;
      else if (v.visibility === 'discovered') discoveredC += 1;
      else unseenC += 1;
    }
    return { ownedC, discoveredC, unseenC, total: cards.length };
  }, [visible, cards.length]);

  const displayedCards = useMemo(
    () => (hideUnseen ? visible.filter((v) => v.visibility !== 'unseen') : visible),
    [visible, hideUnseen],
  );

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
          label={hideUnseen ? 'Show Unseen Silhouettes: OFF' : 'Show Unseen Silhouettes: ON'}
          onPress={() => setHideUnseen((v) => !v)}
        />
        <AppButton
          label={`Rarity: ${rarity}`}
          onPress={() => {
            const order: Array<typeof rarity> = ['All', 'Common', 'Rare', 'Epic', 'Legendary'];
            const next = order[(order.indexOf(rarity) + 1) % order.length];
            applyFilters({ rarity: next });
          }}
        />
      </View>
      <AppText>
        {`Owned ${totals.ownedC} • Discovered ${totals.discoveredC} • Unseen ${totals.unseenC} / Total ${totals.total}`}
      </AppText>
      <ScrollView contentContainerStyle={styles.list}>
        {displayedCards.map((v) => (
          <CardTile
            key={v.card.id}
            card={v.card}
            owned={v.owned}
            visibility={v.visibility}
            onPress={
              v.visibility === 'unseen'
                ? undefined
                : () => navigation.navigate('CardDetails', { cardId: v.card.id })
            }
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
