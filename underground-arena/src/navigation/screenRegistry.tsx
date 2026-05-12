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
  // Phase-05 dev surfaces — kept here so PlaceholderScreen's titleMap stays
  // complete and TypeScript won't complain about missing keys.
  { name: 'EncounterHub', title: 'Encounter Hub' },
  { name: 'DevMatchmaking', title: 'Dev • Matchmaking' },
  { name: 'DevTournaments', title: 'Dev • Tournaments' },
  { name: 'DevSurvival', title: 'Dev • Survival' },
  { name: 'DevRivals', title: 'Dev • Rivals' },
  { name: 'DevBosses', title: 'Dev • Bosses' },
  { name: 'DevDailyChallenges', title: 'Dev • Daily Challenges' },
  { name: 'DevProceduralEvents', title: 'Dev • Procedural Events' },
];

export const screenTitleMap: Record<keyof RootStackParamList, string> = screenRegistry.reduce(
  (acc, screen) => {
    acc[screen.name] = screen.title;
    return acc;
  },
  {} as Record<keyof RootStackParamList, string>,
);
