export type CardCategory =
  | 'Punch'
  | 'Kick'
  | 'Grappling'
  | 'Submission'
  | 'Counter'
  | 'Defense'
  | 'Passive'
  | 'Ultimate';

export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export type StatusEffectType =
  | 'bleeding'
  | 'stun'
  | 'exhaustion'
  | 'adrenaline'
  | 'defense_break'
  | 'stamina_burn'
  | 'combo_boost'
  | 'accuracy_reduction'
  | null;

export type CardDefinition = {
  id: string;
  name: string;
  description: string;
  category: CardCategory;
  rarity: CardRarity;
  staminaCost: number;
  damage: number;
  cooldown: number;
  accuracy: number;
  criticalChance: number;
  comboPotential: number;
  unlockLevel: number;
  animationType: string;
  statusEffect: StatusEffectType;
  statusEffectChance: number;
  duration: number;
  icon: string;
  visualEffect: string;
  flavorText: string;
};

export type OwnedCard = {
  cardId: string;
  quantity: number;
  level: number;
  favorite: boolean;
  acquiredAt: number;
};

export type DeckPreset = {
  id: string;
  name: string;
  cardIds: string[];
  updatedAt: number;
};

export type CardFilter = {
  rarity?: CardRarity;
  category?: CardCategory;
  favoritesOnly?: boolean;
  ownedOnly?: boolean;
};

export type CardSort =
  | 'rarity'
  | 'damage'
  | 'cooldown'
  | 'staminaCost'
  | 'alphabetical'
  | 'newest'
  | 'strongest';
