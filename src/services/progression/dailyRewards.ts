import { ECONOMY_CONFIG } from '@/data/progression/economyConfig';

const DAY_MS = 24 * 60 * 60 * 1000;

export type DailyClaim = {
  lastClaimAt: number;
  streakDays: number;
};

export type DailyClaimResult = {
  ok: boolean;
  coinsAwarded: number;
  nextStreakDays: number;
  reason?: string;
};

export function canClaimDaily(claim: DailyClaim, now = Date.now()): boolean {
  if (claim.lastClaimAt === 0) return true;
  return now - claim.lastClaimAt >= DAY_MS;
}

export function claimDaily(claim: DailyClaim, now = Date.now()): DailyClaimResult {
  if (!canClaimDaily(claim, now)) {
    return { ok: false, coinsAwarded: 0, nextStreakDays: claim.streakDays, reason: 'Already claimed today.' };
  }
  const elapsed = now - claim.lastClaimAt;
  const continued = claim.lastClaimAt !== 0 && elapsed < DAY_MS * 2;
  const nextStreakDays = Math.min(
    ECONOMY_CONFIG.dailyMaxStreakDays,
    (continued ? claim.streakDays : 0) + 1,
  );
  const coins = ECONOMY_CONFIG.dailyLoginBaseCoins + ECONOMY_CONFIG.dailyStreakStep * (nextStreakDays - 1);
  return { ok: true, coinsAwarded: coins, nextStreakDays };
}
