import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { theme } from '@/themes';

type CurrencyDisplayProps = {
  coins: number;
  gems: number;
};

export function CurrencyDisplay({ coins, gems }: CurrencyDisplayProps) {
  return (
    <View style={styles.row}>
      <AppText>{`Coins: ${coins}`}</AppText>
      <AppText>{`Gems: ${gems}`}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
});
