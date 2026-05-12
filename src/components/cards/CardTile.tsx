import { StyleSheet, View, Pressable } from 'react-native';
import { AppCard, AppText } from '@/components/base';
import type { CardDefinition, OwnedCard } from '@/types/cards';
import { CardRarityBadge } from './CardRarityBadge';

type Props = {
  card: CardDefinition;
  owned?: OwnedCard;
  onPress?: () => void;
};

export function CardTile({ card, owned, onPress }: Props) {
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
});
