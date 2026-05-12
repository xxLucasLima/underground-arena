import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import type { RootStackParamList } from '@/types/navigation';

type ScreenConfig = {
  name: keyof RootStackParamList;
  title: string;
};

export const screenRegistry: ScreenConfig[] = [
  { name: 'Splash', title: 'Splash Screen' },
  { name: 'MainMenu', title: 'Main Menu' },
  { name: 'FighterProfile', title: 'Fighter Profile' },
  { name: 'CardCollection', title: 'Card Collection' },
  { name: 'DeckBuilder', title: 'Deck Builder' },
  { name: 'Fight', title: 'Fight Screen' },
  { name: 'Rewards', title: 'Rewards Screen' },
  { name: 'Shop', title: 'Shop' },
  { name: 'Tournament', title: 'Tournament' },
  { name: 'TrainingGym', title: 'Training Gym' },
  { name: 'Settings', title: 'Settings' },
];

export const screenTitleMap: Record<keyof RootStackParamList, string> = screenRegistry.reduce(
  (acc, screen) => {
    acc[screen.name] = screen.title;
    return acc;
  },
  {} as Record<keyof RootStackParamList, string>,
);

export const placeholderComponent = PlaceholderScreen;
