import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { theme } from '@/themes';
import { placeholderComponent, screenRegistry } from './screenRegistry';

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
      {screenRegistry.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={placeholderComponent}
          initialParams={{ title: screen.title } as never}
          options={{ title: screen.title }}
        />
      ))}
    </Stack.Navigator>
  );
}
