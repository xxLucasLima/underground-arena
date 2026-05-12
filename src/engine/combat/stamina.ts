import type { FighterProfile, FighterRuntime } from './types';
import { staminaRegen } from './stats';

export function spendStamina(runtime: FighterRuntime, cost: number): FighterRuntime {
  return { ...runtime, stamina: Math.max(0, runtime.stamina - cost) };
}

export function regenerateStamina(runtime: FighterRuntime, profile: FighterProfile, baseRegen: number): FighterRuntime {
  const next = runtime.stamina + staminaRegen(profile.stats, baseRegen);
  return { ...runtime, stamina: Math.min(profile.maxStamina, next) };
}
