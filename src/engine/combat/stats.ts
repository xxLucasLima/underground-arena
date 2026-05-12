import type { FighterRuntime, FighterStats } from './types';

export function damageModifier(stats: FighterStats, runtime: FighterRuntime, lowStaminaThreshold: number) {
  const strength = 0.8 + stats.strength / 100;
  const lowStaminaPenalty = runtime.stamina < lowStaminaThreshold ? 0.8 : 1;
  return strength * lowStaminaPenalty;
}

export function accuracyModifier(stats: FighterStats, runtime: FighterRuntime, lowStaminaThreshold: number) {
  const technique = stats.technique / 100;
  const lowStamina = runtime.stamina < lowStaminaThreshold ? -10 : 0;
  return technique * 100 + lowStamina;
}

export function defenseModifier(stats: FighterStats) {
  return Math.min(0.6, stats.defense / 200);
}

export function knockoutResistance(stats: FighterStats) {
  return Math.min(0.9, stats.chin / 120);
}

export function comboChanceModifier(stats: FighterStats, runtime: FighterRuntime) {
  return stats.speed * 0.3 + stats.aggression * 0.2 + runtime.comboMomentum * 4;
}

export function staminaRegen(stats: FighterStats, baseRegen: number) {
  return baseRegen + stats.cardio * 0.05;
}
