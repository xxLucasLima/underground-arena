import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CardCollectionScreen } from '@/screens/CardCollectionScreen';
import { CardDetailsScreen } from '@/screens/CardDetailsScreen';
import { CombatDebugScreen } from '@/screens/CombatDebugScreen';
import { DeckBuilderScreen } from '@/screens/DeckBuilderScreen';
import { FightScreen } from '@/screens/FightScreen';
import { MainMenuScreen } from '@/screens/MainMenuScreen';
import { PackOpeningScreen } from '@/screens/PackOpeningScreen';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { RewardsScreen } from '@/screens/RewardsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import {
  DevBossesScreen,
  DevDailyChallengesScreen,
  DevMatchmakingScreen,
  DevProceduralEventsScreen,
  DevRivalsScreen,
  DevSurvivalScreen,
  DevTournamentsScreen,
  EncounterHubScreen,
} from '@/screens/dev';
import type { RootStackParamList } from '@/types/navigation';
import { theme } from '@/themes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainMenu"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.background },
        // Phase-06: switch from the default slide to a softer fade for a more
        // "polished menu" feel. Fight & Rewards screens still get a slide push
        // via their explicit screenOptions below.
        animation: 'fade',
        animationDuration: 220,
      }}
    >
      <Stack.Screen name="Splash" component={PlaceholderScreen} options={{ title: 'Splash Screen' }} />
      <Stack.Screen name="MainMenu" component={MainMenuScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FighterProfile" component={PlaceholderScreen} options={{ title: 'Fighter Profile' }} />
      <Stack.Screen name="CardCollection" component={CardCollectionScreen} options={{ title: 'Card Collection' }} />
      <Stack.Screen name="DeckBuilder" component={DeckBuilderScreen} options={{ title: 'Deck Builder' }} />
      <Stack.Screen
        name="Fight"
        component={FightScreen}
        options={{ headerShown: false, animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="CombatDebug" component={CombatDebugScreen} options={{ title: 'Combat Debug' }} />
      <Stack.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen name="Shop" component={PlaceholderScreen} options={{ title: 'Shop' }} />
      <Stack.Screen name="Tournament" component={PlaceholderScreen} options={{ title: 'Tournament' }} />
      <Stack.Screen name="TrainingGym" component={PlaceholderScreen} options={{ title: 'Training Gym' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="CardDetails" component={CardDetailsScreen} options={{ title: 'Card Details' }} />
      <Stack.Screen name="PackOpening" component={PackOpeningScreen} options={{ title: 'Pack Opening' }} />

      {/* Phase-05 dev surfaces */}
      <Stack.Screen name="EncounterHub" component={EncounterHubScreen} options={{ title: 'Encounter Hub' }} />
      <Stack.Screen name="DevMatchmaking" component={DevMatchmakingScreen} options={{ title: 'Dev • Matchmaking' }} />
      <Stack.Screen name="DevTournaments" component={DevTournamentsScreen} options={{ title: 'Dev • Tournaments' }} />
      <Stack.Screen name="DevSurvival" component={DevSurvivalScreen} options={{ title: 'Dev • Survival' }} />
      <Stack.Screen name="DevRivals" component={DevRivalsScreen} options={{ title: 'Dev • Rivals' }} />
      <Stack.Screen name="DevBosses" component={DevBossesScreen} options={{ title: 'Dev • Bosses' }} />
      <Stack.Screen name="DevDailyChallenges" component={DevDailyChallengesScreen} options={{ title: 'Dev • Daily Challenges' }} />
      <Stack.Screen name="DevProceduralEvents" component={DevProceduralEventsScreen} options={{ title: 'Dev • Procedural Events' }} />
    </Stack.Navigator>
  );
}
