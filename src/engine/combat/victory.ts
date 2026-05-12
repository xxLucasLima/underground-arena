import type { CardDefinition } from '@/types/cards';
import { chance, type RNG } from './rng';
import { knockoutResistance } from './stats';
import type { FighterProfile, FighterRuntime } from './types';

export function checkKnockout(rng: RNG, defender: FighterProfile, runtime: FighterRuntime, damage: number) {
  if (runtime.hp - damage > 0) return { knockedOut: false, staggered: damage > 18 };
  const resist = knockoutResistance(defender.stats);
  const koChance = 60 + (damage - 20) * 1.2 - resist * 50;
  const knockedOut = chance(rng, Math.max(20, Math.min(95, koChance)));
  return { knockedOut, staggered: !knockedOut };
}

export function checkSubmission(rng: RNG, attacker: FighterProfile, defender: FighterRuntime, card: CardDefinition) {
  if (card.category !== 'Submission' && card.category !== 'Grappling') return false;
  if (defender.stamina > 25) return false;
  const baseChance = 18 + attacker.stats.technique * 0.4 - defender.stamina * 0.5;
  return chance(rng, Math.max(5, Math.min(80, baseChance)));
}
