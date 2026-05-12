import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CardCollectionScreen } from '@/screens/CardCollectionScreen';
import { CardDetailsScreen } from '@/screens/CardDetailsScreen';
import { CombatDebugScreen } from '@/screens/CombatDebugScreen';
import { DeckBuilderScreen } from '@/screens/DeckBuilderScreen';
import { PackOpeningScreen } from '@/screens/PackOpeningScreen';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import type { RootStackParamList } from '@/types/navigation';
import { theme } from '@/themes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Splash" component={PlaceholderScreen} options={{ title: 'Splash Screen' }} />
      <Stack.Screen name="MainMenu" component={PlaceholderScreen} options={{ title: 'Main Menu' }} />
      <Stack.Screen name="FighterProfile" component={PlaceholderScreen} options={{ title: 'Fighter Profile' }} />
      <Stack.Screen name="CardCollection" component={CardCollectionScreen} options={{ title: 'Card Collection' }} />
      <Stack.Screen name="DeckBuilder" component={DeckBuilderScreen} options={{ title: 'Deck Builder' }} />
      <Stack.Screen name="Fight" component={PlaceholderScreen} options={{ title: 'Fight Screen' }} />
      <Stack.Screen name="CombatDebug" component={CombatDebugScreen} options={{ title: 'Combat Debug' }} />
      <Stack.Screen name="Rewards" component={PlaceholderScreen} options={{ title: 'Rewards Screen' }} />
      <Stack.Screen name="Shop" component={PlaceholderScreen} options={{ title: 'Shop' }} />
      <Stack.Screen name="Tournament" component={PlaceholderScreen} options={{ title: 'Tournament' }} />
      <Stack.Screen name="TrainingGym" component={PlaceholderScreen} options={{ title: 'Training Gym' }} />
      <Stack.Screen name="Settings" component={PlaceholderScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="CardDetails" component={CardDetailsScreen} options={{ title: 'Card Details' }} />
      <Stack.Screen name="PackOpening" component={PackOpeningScreen} options={{ title: 'Pack Opening' }} />
    </Stack.Navigator>
  );
}
