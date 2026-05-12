import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { AppButton, ScreenHeader, ScreenContainer } from '@/components/base';
import { AppText } from '@/components/base';
import type { RootStackParamList } from '@/types/navigation';
import { screenTitleMap } from '@/navigation/screenRegistry';
import { theme } from '@/themes';

type Props = NativeStackScreenProps<RootStackParamList, keyof RootStackParamList>;

export function PlaceholderScreen({ route, navigation }: Props) {
  const title = screenTitleMap[route.name];

  return (
    <ScreenContainer>
      <ScreenHeader title={title} />
      <View style={styles.body}>
        <AppText>{route.name === 'Splash' ? 'Welcome to Underground Arena' : `${title} placeholder`}</AppText>
        {(route.name === 'Splash' || route.name === 'MainMenu') ? (
          <View style={styles.menu}>
            <AppButton label="Card Collection" onPress={() => navigation.navigate('CardCollection')} />
            <AppButton label="Deck Builder" onPress={() => navigation.navigate('DeckBuilder')} />
            <AppButton label="Open Pack" onPress={() => navigation.navigate('PackOpening', { packType: 'Bronze' })} />
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  menu: {
    gap: theme.spacing.sm,
    width: '100%',
    maxWidth: 320,
  },
});
