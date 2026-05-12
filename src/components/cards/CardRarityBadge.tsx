import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/base';
import type { CardRarity } from '@/types/cards';

const rarityColor: Record<CardRarity, string> = {
  Common: '#8A8A8A',
  Rare: '#4E7BFF',
  Epic: '#B04EFF',
  Legendary: '#FFB547',
};

export function CardRarityBadge({ rarity }: { rarity: CardRarity }) {
  return (
    <View style={[styles.badge, { borderColor: rarityColor[rarity] }]}>
      <AppText style={[styles.label, { color: rarityColor[rarity] }]}>{rarity}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  label: { fontSize: 12, fontWeight: '700' },
});
