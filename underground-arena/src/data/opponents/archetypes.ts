import type { AIPersonality, FighterStats } from '@/engine/combat/types';
import type { CardCategory } from '@/types/cards';

/**
 * A FighterArchetype is a *style description* — the soul of an opponent.
 *
 *  - statBias: relative weights summed up & scaled by power tier; never absolute.
 *  - categoryBias: probability weights used by deck generator. Numbers are
 *    *relative*, the generator normalizes them.
 *  - personalityPool: list of compatible personalities; one is picked.
 *  - rarityBoost: how often the archetype rolls higher-rarity cards.
 *
 * Adding a new archetype = adding an entry here. No engine changes.
 */
export type FighterArchetype = {
  id: string;
  name: string;
  fightingStyle: string;
  statBias: FighterStats;
  categoryBias: Record<CardCategory, number>;
  personalityPool: AIPersonality[];
  preferredCombos: CardCategory[][];
  rarityBoost: number; // 0..1, additive when rolling card rarities
  nicknameTags: string[]; // pool used to flavor nicknames (e.g. 'striker', 'snake')
};

const zeroCategories: Record<CardCategory, number> = {
  Punch: 0,
  Kick: 0,
  Grappling: 0,
  Submission: 0,
  Counter: 0,
  Defense: 0,
  Passive: 0,
  Ultimate: 0,
};

const cat = (overrides: Partial<Record<CardCategory, number>>): Record<CardCategory, number> => ({
  ...zeroCategories,
  ...overrides,
});

export const ARCHETYPES: FighterArchetype[] = [
  {
    id: 'striker',
    name: 'Pure Striker',
    fightingStyle: 'Boxing',
    statBias: { strength: 65, speed: 60, cardio: 55, technique: 60, defense: 45, chin: 55, aggression: 60 },
    categoryBias: cat({ Punch: 5, Kick: 2, Counter: 2, Defense: 1, Ultimate: 1 }),
    personalityPool: ['aggressive', 'combo-focused'],
    preferredCombos: [['Punch', 'Punch'], ['Punch', 'Counter']],
    rarityBoost: 0.05,
    nicknameTags: ['striker', 'hammer', 'power'],
  },
  {
    id: 'kickboxer',
    name: 'Kickboxer',
    fightingStyle: 'Muay Thai',
    statBias: { strength: 55, speed: 60, cardio: 65, technique: 65, defense: 50, chin: 55, aggression: 55 },
    categoryBias: cat({ Punch: 2, Kick: 5, Counter: 1, Defense: 2, Ultimate: 1 }),
    personalityPool: ['aggressive', 'tactical'],
    preferredCombos: [['Kick', 'Kick'], ['Punch', 'Kick']],
    rarityBoost: 0.04,
    nicknameTags: ['storm', 'cyclone', 'thunder'],
  },
  {
    id: 'grappler',
    name: 'Grappler',
    fightingStyle: 'Wrestling',
    statBias: { strength: 70, speed: 50, cardio: 60, technique: 60, defense: 65, chin: 60, aggression: 50 },
    categoryBias: cat({ Grappling: 5, Submission: 2, Defense: 2, Counter: 1, Punch: 1 }),
    personalityPool: ['tactical', 'defensive'],
    preferredCombos: [['Grappling', 'Grappling'], ['Grappling', 'Submission']],
    rarityBoost: 0.03,
    nicknameTags: ['bear', 'titan', 'crusher'],
  },
  {
    id: 'submission-specialist',
    name: 'Submission Specialist',
    fightingStyle: 'BJJ',
    statBias: { strength: 50, speed: 55, cardio: 60, technique: 75, defense: 60, chin: 50, aggression: 45 },
    categoryBias: cat({ Submission: 5, Grappling: 3, Counter: 2, Defense: 2 }),
    personalityPool: ['tactical', 'counter-focused'],
    preferredCombos: [['Grappling', 'Submission'], ['Counter', 'Submission']],
    rarityBoost: 0.06,
    nicknameTags: ['snake', 'cobra', 'constrictor'],
  },
  {
    id: 'counter-puncher',
    name: 'Counter Puncher',
    fightingStyle: 'Outboxing',
    statBias: { strength: 55, speed: 65, cardio: 60, technique: 70, defense: 65, chin: 50, aggression: 40 },
    categoryBias: cat({ Counter: 5, Defense: 3, Punch: 3, Kick: 1 }),
    personalityPool: ['counter-focused', 'defensive'],
    preferredCombos: [['Defense', 'Counter'], ['Counter', 'Punch']],
    rarityBoost: 0.05,
    nicknameTags: ['ghost', 'phantom', 'shadow'],
  },
  {
    id: 'brawler',
    name: 'Brawler',
    fightingStyle: 'Reckless',
    statBias: { strength: 75, speed: 50, cardio: 55, technique: 45, defense: 35, chin: 75, aggression: 75 },
    categoryBias: cat({ Punch: 4, Kick: 2, Ultimate: 2, Defense: 1 }),
    personalityPool: ['aggressive', 'reckless'],
    preferredCombos: [['Punch', 'Ultimate']],
    rarityBoost: 0.02,
    nicknameTags: ['bull', 'wrecker', 'beast'],
  },
  {
    id: 'tactician',
    name: 'Tactician',
    fightingStyle: 'Mixed',
    statBias: { strength: 55, speed: 60, cardio: 65, technique: 70, defense: 60, chin: 55, aggression: 50 },
    categoryBias: cat({ Punch: 2, Kick: 2, Grappling: 2, Defense: 2, Counter: 3, Submission: 1 }),
    personalityPool: ['tactical', 'combo-focused'],
    preferredCombos: [['Defense', 'Punch'], ['Counter', 'Kick']],
    rarityBoost: 0.05,
    nicknameTags: ['professor', 'surgeon', 'mind'],
  },
  {
    id: 'heavy-striker',
    name: 'Heavy Striker',
    fightingStyle: 'Power Boxing',
    statBias: { strength: 80, speed: 45, cardio: 50, technique: 55, defense: 50, chin: 70, aggression: 65 },
    categoryBias: cat({ Punch: 4, Ultimate: 3, Kick: 1, Defense: 1 }),
    personalityPool: ['aggressive', 'reckless'],
    preferredCombos: [['Punch', 'Ultimate'], ['Punch', 'Punch']],
    rarityBoost: 0.05,
    nicknameTags: ['hammer', 'bonecrusher', 'sledge'],
  },
];

export function getArchetype(id: string): FighterArchetype | undefined {
  return ARCHETYPES.find((a) => a.id === id);
}
