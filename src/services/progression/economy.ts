import { ECONOMY_CONFIG } from '@/data/progression/economyConfig';
import type { Currencies } from './types';

export function addCoins(currencies: Currencies, amount: number): Currencies {
  return { ...currencies, coins: Math.max(0, currencies.coins + amount) };
}

export function spendCoins(currencies: Currencies, amount: number): { ok: boolean; next: Currencies } {
  if (currencies.coins < amount) return { ok: false, next: currencies };
  return { ok: true, next: { ...currencies, coins: currencies.coins - amount } };
}

export function streakBonus(streak: number): number {
  const tier = Math.min(ECONOMY_CONFIG.maxStreakBonusTiers, streak);
  return ECONOMY_CONFIG.fightStreakStep * tier;
}
