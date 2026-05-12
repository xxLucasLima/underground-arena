export type AchievementId =
  | 'first_blood'
  | 'first_ko'
  | 'first_submission'
  | 'streak_3'
  | 'streak_10'
  | 'level_5'
  | 'level_25'
  | 'collector_10'
  | 'collector_50';

export type AchievementDefinition = {
  id: AchievementId;
  name: string;
  description: string;
  reward: { coins?: number; xp?: number };
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'first_blood',      name: 'First Blood',       description: 'Win your first fight.',                  reward: { coins: 100, xp: 25 } },
  { id: 'first_ko',         name: 'KO Artist',         description: 'Knock out an opponent.',                 reward: { coins: 150, xp: 35 } },
  { id: 'first_submission', name: 'Tap Out',           description: 'Win by submission.',                     reward: { coins: 150, xp: 35 } },
  { id: 'streak_3',         name: 'On Fire',           description: 'Win 3 fights in a row.',                 reward: { coins: 200, xp: 60 } },
  { id: 'streak_10',        name: 'Unstoppable',       description: 'Win 10 fights in a row.',                reward: { coins: 800, xp: 250 } },
  { id: 'level_5',          name: 'Rising Star',       description: 'Reach level 5.',                         reward: { coins: 250, xp: 0 } },
  { id: 'level_25',         name: 'Veteran',           description: 'Reach level 25.',                        reward: { coins: 1500, xp: 0 } },
  { id: 'collector_10',     name: 'Collector',         description: 'Own 10 different cards.',                reward: { coins: 200, xp: 50 } },
  { id: 'collector_50',     name: 'Card Curator',      description: 'Own 50 different cards.',                reward: { coins: 1000, xp: 250 } },
];
