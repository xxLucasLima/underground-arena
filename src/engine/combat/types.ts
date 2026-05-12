import type { CardDefinition, StatusEffectType } from '@/types/cards';

export type AIPersonality =
  | 'aggressive'
  | 'defensive'
  | 'tactical'
  | 'reckless'
  | 'combo-focused'
  | 'counter-focused';

export type FighterStats = {
  strength: number;
  speed: number;
  cardio: number;
  technique: number;
  defense: number;
  chin: number;
  aggression: number;
};

export type FighterProfile = {
  id: string;
  name: string;
  stats: FighterStats;
  personality: AIPersonality;
  deck: CardDefinition[];
  maxHp: number;
  maxStamina: number;
};

export type ActiveStatusEffect = {
  type: NonNullable<StatusEffectType>;
  remaining: number;
  magnitude: number;
  sourceCardId: string;
};

export type FighterRuntime = {
  id: string;
  hp: number;
  stamina: number;
  comboMomentum: number;
  cooldowns: Record<string, number>;
  effects: ActiveStatusEffect[];
  staggered: boolean;
  defeated: boolean;
  finisher: 'KO' | 'Submission' | null;
  /** Most recent cards played by this fighter (most recent last). */
  recentCardIds: string[];
  /** Most recent categories played, used for diversity scoring. */
  recentCategories: string[];
  /** Turns since last critical hit landed, used for occasional risky pivots. */
  turnsSinceCritical: number;
};

export type CombatEventType =
  | 'matchStart'
  | 'roundStart'
  | 'cardPlayed'
  | 'damageDealt'
  | 'critical'
  | 'combo'
  | 'counter'
  | 'statusApplied'
  | 'statusExpired'
  | 'staminaChange'
  | 'stagger'
  | 'knockout'
  | 'submission'
  | 'matchEnd';

export type CombatEvent = {
  type: CombatEventType;
  turn: number;
  actorId?: string;
  targetId?: string;
  cardId?: string;
  amount?: number;
  status?: NonNullable<StatusEffectType>;
  message: string;
};

export type CombatState = {
  turn: number;
  activeFighterId: string;
  fighters: Record<string, FighterRuntime>;
  profiles: Record<string, FighterProfile>;
  log: CombatEvent[];
  winnerId: string | null;
  finished: boolean;
};

export type CombatConfig = {
  maxTurns: number;
  staminaRegenPerTurn: number;
  lowStaminaThreshold: number;
};

export const DEFAULT_COMBAT_CONFIG: CombatConfig = {
  maxTurns: 40,
  staminaRegenPerTurn: 6,
  lowStaminaThreshold: 25,
};
