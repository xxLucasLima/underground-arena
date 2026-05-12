import { CARD_DEFINITIONS } from '@/data/cards';
import type { CardDefinition, CardRarity } from '@/types/cards';

export type PackType = 'Bronze' | 'Silver' | 'Gold' | 'Legendary';

const PACK_RATES: Record<PackType, Array<{ rarity: CardRarity; weight: number }>> = {
  Bronze: [
    { rarity: 'Common', weight: 75 },
    { rarity: 'Rare', weight: 22 },
    { rarity: 'Epic', weight: 3 },
    { rarity: 'Legendary', weight: 0 },
  ],
  Silver: [
    { rarity: 'Common', weight: 55 },
    { rarity: 'Rare', weight: 33 },
    { rarity: 'Epic', weight: 10 },
    { rarity: 'Legendary', weight: 2 },
  ],
  Gold: [
    { rarity: 'Common', weight: 35 },
    { rarity: 'Rare', weight: 35 },
    { rarity: 'Epic', weight: 22 },
    { rarity: 'Legendary', weight: 8 },
  ],
  Legendary: [
    { rarity: 'Common', weight: 0 },
    { rarity: 'Rare', weight: 20 },
    { rarity: 'Epic', weight: 50 },
    { rarity: 'Legendary', weight: 30 },
  ],
};

function rollRarity(pack: PackType): CardRarity {
  const rates = PACK_RATES[pack];
  const total = rates.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of rates) {
    roll -= r.weight;
    if (roll <= 0) return r.rarity;
  }
  return 'Common';
}

export function openPack(pack: PackType, count = 4): CardDefinition[] {
  const rewards: CardDefinition[] = [];
  for (let i = 0; i < count; i += 1) {
    const rarity = rollRarity(pack);
    const pool = CARD_DEFINITIONS.filter((c) => c.rarity === rarity);
    const fallback = CARD_DEFINITIONS.filter((c) => c.rarity !== 'Legendary');
    const selectedPool = pool.length ? pool : fallback;
    rewards.push(selectedPool[Math.floor(Math.random() * selectedPool.length)]);
  }
  return rewards;
}
