import { createRng } from '@/engine/combat/rng';
import {
  DAILY_CHALLENGE_COUNT,
  DAILY_CHALLENGE_TEMPLATES,
  type DailyChallengeTemplate,
} from '@/data/modes/dailyChallenges';
import { generateAIFighter } from '@/services/opponents/fighterGenerator';
import type { AIFighter } from '@/services/opponents/types';

/**
 * Daily challenges follow this contract:
 *  - The DAILY SEED is derived from a UTC YYYY-MM-DD string so all players
 *    share the same set of restrictions per day (great for streamability
 *    and social comparison later).
 *  - The OPPONENT seed is derived from (dailySeed XOR playerId hash), so
 *    each player still sees a unique-feeling matchup.
 *  - Restrictions are not enforced here; the combat layer reads
 *    `instance.restriction` to enforce them when running the fight.
 */
export type DailyChallengeInstance = {
  templateId: string;
  date: string; // YYYY-MM-DD
  restriction: DailyChallengeTemplate['restriction'];
  opponent: AIFighter;
  reward: DailyChallengeTemplate['reward'];
  completed: boolean;
};

export function todayDateString(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Hash a string into a stable 32-bit integer seed. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

export function rollDailyChallenges(args: {
  date?: string;
  playerId: string;
  playerLevel: number;
}): DailyChallengeInstance[] {
  const date = args.date ?? todayDateString();
  const dailySeed = hashString(`daily:${date}`);
  const playerSeed = hashString(`player:${args.playerId}`);

  const rng = createRng(dailySeed);

  // Sample without replacement.
  const pool = [...DAILY_CHALLENGE_TEMPLATES];
  const picks: DailyChallengeTemplate[] = [];
  const count = Math.min(DAILY_CHALLENGE_COUNT, pool.length);
  for (let i = 0; i < count; i += 1) {
    const idx = Math.floor(rng() * pool.length) % pool.length;
    picks.push(pool.splice(idx, 1)[0]);
  }

  return picks.map((tpl, i) => {
    const seed = (dailySeed ^ playerSeed ^ (i * 7919)) >>> 0;
    const opponent = generateAIFighter({
      seed,
      league: tpl.league,
      effectiveLevel: args.playerLevel,
      difficultyDrift: tpl.difficultyDrift,
    });
    return {
      templateId: tpl.id,
      date,
      restriction: tpl.restriction,
      opponent,
      reward: tpl.reward,
      completed: false,
    };
  });
}

export function markCompleted(
  list: DailyChallengeInstance[],
  templateId: string,
): DailyChallengeInstance[] {
  return list.map((c) => (c.templateId === templateId ? { ...c, completed: true } : c));
}
