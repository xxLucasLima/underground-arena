import type { PackType } from '@/services/cards/packSystem';

export type RootStackParamList = {
  Splash: undefined;
  MainMenu: undefined;
  FighterProfile: undefined;
  CardCollection: undefined;
  CardDetails: { cardId: string };
  PackOpening: { packType?: PackType } | undefined;
  DeckBuilder: undefined;
  Fight: undefined;
  CombatDebug: undefined;
  Rewards: undefined;
  Shop: undefined;
  Tournament: undefined;
  TrainingGym: undefined;
  Settings: undefined;

  // --- Phase-05 developer/debug screens ---
  EncounterHub: undefined;
  DevMatchmaking: undefined;
  DevTournaments: undefined;
  DevSurvival: undefined;
  DevRivals: undefined;
  DevBosses: undefined;
  DevDailyChallenges: undefined;
  DevProceduralEvents: undefined;
};
