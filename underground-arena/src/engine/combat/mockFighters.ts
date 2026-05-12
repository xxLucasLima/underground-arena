import { CARD_DEFINITIONS } from '@/data/cards';
import type { FighterProfile } from './types';

export const MOCK_PLAYER: FighterProfile = {
  id: 'player',
  name: 'Player',
  personality: 'combo-focused',
  maxHp: 100,
  maxStamina: 100,
  stats: {
    strength: 55,
    speed: 60,
    cardio: 55,
    technique: 60,
    defense: 50,
    chin: 55,
    aggression: 55,
  },
  deck: CARD_DEFINITIONS,
};

export const MOCK_OPPONENT: FighterProfile = {
  id: 'opponent',
  name: 'Rival',
  personality: 'aggressive',
  maxHp: 100,
  maxStamina: 100,
  stats: {
    strength: 60,
    speed: 50,
    cardio: 45,
    technique: 50,
    defense: 45,
    chin: 50,
    aggression: 65,
  },
  deck: CARD_DEFINITIONS,
};
