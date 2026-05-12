/**
 * Procedural Events — rare modifiers that the matchmaker can attach to any
 * fight to keep the game fresh. They are advisory: the consumer decides if
 * they want to honor the modifier (combat UI usually does).
 *
 * Designers can add new events without touching code.
 */
export type ProceduralEventId =
  | 'crowd-favorite'
  | 'rain-soaked-ring'
  | 'cornerman-tips'
  | 'bloodlust'
  | 'sponsor-bonus'
  | 'underdog-spirit';

export type ProceduralEvent = {
  id: ProceduralEventId;
  name: string;
  description: string;
  /** Likelihood weight when rolling an event. */
  weight: number;
  /** Player-side modifiers (multipliers; 1.0 = unchanged). */
  playerMods?: { damage?: number; stamina?: number; crit?: number };
  /** Opponent-side modifiers. */
  opponentMods?: { damage?: number; stamina?: number; crit?: number };
  /** Reward multipliers on win. */
  rewardMods?: { coins?: number; xp?: number };
};

export const PROCEDURAL_EVENTS: ProceduralEvent[] = [
  {
    id: 'crowd-favorite',
    name: 'Crowd Favorite',
    description: 'The crowd is roaring for you. Bonus crit chance.',
    weight: 4,
    playerMods: { crit: 1.15 },
    rewardMods: { coins: 1.1 },
  },
  {
    id: 'rain-soaked-ring',
    name: 'Rain-Soaked Ring',
    description: 'The footing is awful. Both fighters move slower.',
    weight: 3,
    playerMods: { stamina: 0.9 },
    opponentMods: { stamina: 0.9 },
  },
  {
    id: 'cornerman-tips',
    name: 'Cornerman Tips',
    description: 'Your corner saw an opening. +10% damage.',
    weight: 4,
    playerMods: { damage: 1.1 },
  },
  {
    id: 'bloodlust',
    name: 'Bloodlust',
    description: 'Your opponent fights like a wild animal. +10% opponent damage, +25% rewards.',
    weight: 2,
    opponentMods: { damage: 1.1 },
    rewardMods: { coins: 1.25, xp: 1.25 },
  },
  {
    id: 'sponsor-bonus',
    name: 'Sponsor Bonus',
    description: 'A sponsor doubled tonight\'s purse.',
    weight: 1,
    rewardMods: { coins: 2.0 },
  },
  {
    id: 'underdog-spirit',
    name: 'Underdog Spirit',
    description: 'Everyone wrote you off. +15% damage, +15% rewards.',
    weight: 2,
    playerMods: { damage: 1.15 },
    rewardMods: { coins: 1.15, xp: 1.15 },
  },
];

/** Chance per fight to roll an event (0..1). */
export const EVENT_TRIGGER_CHANCE = 0.15;
