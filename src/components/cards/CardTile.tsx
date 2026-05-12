import { StyleSheet, View, Pressable } from 'react-native';
import { AppCard, AppText } from '@/components/base';
import type { CardDefinition, CardVisibility, OwnedCard } from '@/types/cards';
import { CardRarityBadge } from './CardRarityBadge';

type Props = {
  card: CardDefinition;
  owned?: OwnedCard;
  visibility?: CardVisibility;
  onPress?: () => void;
};

/**
 * Renders a card in one of three states:
 *  - 'unseen'     → silhouette, minimal info, no rarity, no name
 *  - 'discovered' → category + rarity + teaser stats, no flavor / no upgrade info
 *  - 'owned'      → full information including ownership
 *
 * The CardTile is the single visual source of truth for these states so
 * every screen (collection, deck builder, pack reveal) presents them consistently.
 */
export function CardTile({ card, owned, visibility = 'owned', onPress }: Props) {
  if (visibility === 'unseen') {
    return (
      <Pressable onPress={onPress}>
        <AppCard>
          <View style={styles.row}>
            <AppText style={[styles.icon, styles.silhouette]}>❓</AppText>
            <AppText style={styles.silhouette}>???</AppText>
          </View>
          <AppText style={[styles.name, styles.silhouette]}>Unknown Card</AppText>
          <AppText style={styles.silhouette}>Continue fighting to discover new techniques.</AppText>
        </AppCard>
      </Pressable>
    );
  }

  if (visibility === 'discovered') {
    return (
      <Pressable onPress={onPress}>
        <AppCard>
          <View style={styles.row}>
            <AppText style={[styles.icon, styles.discoveredDim]}>{card.icon}</AppText>
            <CardRarityBadge rarity={card.rarity} />
          </View>
          <AppText style={styles.name}>{card.name}</AppText>
          <AppText style={styles.discoveredDim}>{`Category: ${card.category}`}</AppText>
          <AppText style={styles.discoveredDim}>Not yet collected — find it in a pack or reward.</AppText>
        </AppCard>
      </Pressable>
    );
  }

  // Owned
  return (
    <Pressable onPress={onPress}>
      <AppCard>
        <View style={styles.row}>
          <AppText style={styles.icon}>{card.icon}</AppText>
          <CardRarityBadge rarity={card.rarity} />
        </View>
        <AppText style={styles.name}>{card.name}</AppText>
        <AppText>{card.description}</AppText>
        <AppText>{`DMG ${card.damage} • STA ${card.staminaCost} • CD ${card.cooldown}`}</AppText>
        <AppText>{owned ? `Owned x${owned.quantity} • Lv ${owned.level}` : 'Unowned'}</AppText>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  icon: { fontSize: 22 },
  name: { fontSize: 16, fontWeight: '700' },
  silhouette: { opacity: 0.45 },
  discoveredDim: { opacity: 0.75 },
});
