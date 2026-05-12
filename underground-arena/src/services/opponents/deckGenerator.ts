import type { CardDefinition, CardCategory, CardRarity } from '@/types/cards';
import { type RNG, pickWeighted } from '@/engine/combat/rng';
import type { FighterArchetype } from '@/data/opponents/archetypes';
import {
  TIER_DECK_SIZE,
  TIER_RARITY_WEIGHTS,
  type OpponentTier,
} from '@/data/opponents/opponentConfig';

/**
 * Generate a deck for an archetype + tier from the full card pool.
 *
 * Strategy (all data-driven, no hardcoded ids):
 *   1. Filter pool by playable-level (unlockLevel ≤ effectiveLevel).
 *   2. For each deck slot, roll a category weighted by archetype.categoryBias.
 *   3. For that category, pick a card whose rarity is weighted by
 *      (tier rarity weight × archetype.rarityBoost-adjusted bonus).
 *   4. Apply optional `minRarity` floor and `legendaryFloor` from caller
 *      (bosses use this to feel signature).
 *   5. Force-include `forcedCardIds` first if provided & present in pool.
 *
 * Cards may repeat (decks are stacks, not unique sets) — this mirrors the
 * existing combat engine's expectation and keeps decks consistent at low pool
 * sizes.
 */
export function generateDeck(args: {
  rng: RNG;
  pool: CardDefinition[];
  archetype: FighterArchetype;
  tier: OpponentTier;
  effectiveLevel: number;
  minRarity?: CardRarity;
  legendaryFloor?: number;
  forcedCardIds?: string[];
}): CardDefinition[] {
  const {
    rng,
    pool,
    archetype,
    tier,
    effectiveLevel,
    minRarity,
    legendaryFloor = 0,
    forcedCardIds = [],
  } = args;

  const size = TIER_DECK_SIZE[tier];
  const tierWeights = TIER_RARITY_WEIGHTS[tier];
  const playable = pool.filter((c) => c.unlockLevel <= effectiveLevel);
  if (playable.length === 0) return [];

  // Start with forced cards.
  const deck: CardDefinition[] = [];
  for (const id of forcedCardIds) {
    const card = playable.find((c) => c.id === id);
    if (card) deck.push(card);
    if (deck.length >= size) return deck;
  }

  // Weighted category picker.
  const categoryItems = (Object.entries(archetype.categoryBias) as Array<[CardCategory, number]>)
    .filter(([, w]) => w > 0)
    .map(([value, weight]) => ({ value, weight }));

  const rarityFloor: CardRarity[] = (() => {
    if (!minRarity) return [];
    const order: CardRarity[] = ['Common', 'Rare', 'Epic', 'Legendary'];
    return order.slice(order.indexOf(minRarity));
  })();

  let legendariesInserted = 0;

  while (deck.length < size) {
    // 1) Pick category.
    const category = pickWeighted(rng, categoryItems);

    // 2) Build rarity weight set adjusted by archetype.rarityBoost.
    const rarityItems = (Object.entries(tierWeights) as Array<[CardRarity, number]>)
      .filter(([rarity, w]) => {
        if (w <= 0) return false;
        if (rarityFloor.length > 0 && !rarityFloor.includes(rarity)) return false;
        return true;
      })
      .map(([rarity, w]) => {
        const boost = rarity === 'Epic' || rarity === 'Legendary' ? archetype.rarityBoost : 0;
        return { value: rarity, weight: w + boost };
      });

    if (rarityItems.length === 0) break;
    const rarity = pickWeighted(rng, rarityItems);

    // 3) Candidates of (category, rarity). Fallback gracefully if empty.
    const exact = playable.filter((c) => c.category === category && c.rarity === rarity);
    const fallback = playable.filter((c) => c.category === category);
    const candidates = exact.length > 0 ? exact : fallback;
    if (candidates.length === 0) continue;

    const picked = candidates[Math.floor(rng() * candidates.length) % candidates.length];
    deck.push(picked);
    if (picked.rarity === 'Legendary') legendariesInserted += 1;
  }

  // 4) Enforce legendary floor by swapping non-legendaries for legendary
  //    candidates (without changing total size).
  if (legendaryFloor > 0 && legendariesInserted < legendaryFloor) {
    const legendaryPool = playable.filter((c) => c.rarity === 'Legendary');
    let need = legendaryFloor - legendariesInserted;
    for (let i = 0; i < deck.length && need > 0; i += 1) {
      if (deck[i].rarity === 'Legendary') continue;
      const replacement = legendaryPool[Math.floor(rng() * legendaryPool.length) % legendaryPool.length];
      if (replacement) {
        deck[i] = replacement;
        need -= 1;
      }
    }
  }

  return deck;
}

/** Estimate of deck "power" used for soft matchmaking. */
export function estimateDeckPower(deck: CardDefinition[]): number {
  return deck.reduce((acc, c) => acc + c.damage + c.criticalChance * 0.2, 0);
}
