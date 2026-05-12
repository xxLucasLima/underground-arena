import { ENERGY_CONFIG } from '@/data/progression/energyConfig';
import type { EnergyState } from './types';

export function createInitialEnergy(now = Date.now()): EnergyState {
  return { current: ENERGY_CONFIG.maxEnergy, max: ENERGY_CONFIG.maxEnergy, lastUpdatedAt: now };
}

/** Applies passive regeneration based on elapsed time. Pure. */
export function tickEnergy(state: EnergyState, now = Date.now()): EnergyState {
  if (state.current >= state.max) return { ...state, lastUpdatedAt: now };
  const elapsedSec = Math.max(0, Math.floor((now - state.lastUpdatedAt) / 1000));
  const recovered = Math.floor(elapsedSec / ENERGY_CONFIG.regenSeconds);
  if (recovered <= 0) return state;
  const next = Math.min(state.max, state.current + recovered);
  const consumedSec = recovered * ENERGY_CONFIG.regenSeconds;
  return { ...state, current: next, lastUpdatedAt: state.lastUpdatedAt + consumedSec * 1000 };
}

export function spendEnergy(state: EnergyState, cost: number, now = Date.now()): { ok: boolean; next: EnergyState } {
  const ticked = tickEnergy(state, now);
  if (ticked.current < cost) return { ok: false, next: ticked };
  const next: EnergyState = { ...ticked, current: ticked.current - cost };
  // Start regen clock if we are now below max.
  if (next.current < next.max && ticked.current === ticked.max) {
    return { ok: true, next: { ...next, lastUpdatedAt: now } };
  }
  return { ok: true, next };
}

export function refillEnergy(state: EnergyState, amount: number, now = Date.now()): EnergyState {
  const ticked = tickEnergy(state, now);
  return { ...ticked, current: Math.min(ticked.max, ticked.current + amount) };
}

export function timeUntilNextEnergy(state: EnergyState, now = Date.now()): number {
  if (state.current >= state.max) return 0;
  const elapsedSec = Math.floor((now - state.lastUpdatedAt) / 1000);
  return Math.max(0, ENERGY_CONFIG.regenSeconds - (elapsedSec % ENERGY_CONFIG.regenSeconds));
}
