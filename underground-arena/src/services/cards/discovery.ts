import { DISCOVERY_CONFIG } from '@/data/cards/discoveryConfig';
import type { CardDefinition, CardVisibility, OwnedCard } from '@/types/cards';

/**
 * Pure functions for card visibility. All visibility logic lives here so
 * UI/store never invent ad-hoc rules.
 */

export type DiscoveryState = {
  /** ids the player has at least seen the silhouette of. */
  discoveredIds: string[];
};

export function createInitialDiscovery(): DiscoveryState {
  return { discoveredIds: [...DISCOVERY_CONFIG.initialDiscoveredIds] };
}

/** Compute visibility for one card. Owned > Discovered > Unseen. */
export function getCardVisibility(
  card: CardDefinition,
  owned: Record<string, OwnedCard>,
  discovery: DiscoveryState,
): CardVisibility {
  if (owned[card.id]) return 'owned';
  if (discovery.discoveredIds.includes(card.id)) return 'discovered';
  return 'unseen';
}

/** Adds ids to the discovered set, returning a new state. Idempotent. */
export function discoverCards(state: DiscoveryState, ids: string[]): DiscoveryState {
  if (ids.length === 0) return state;
  const set = new Set(state.discoveredIds);
  ids.forEach((id) => set.add(id));
  if (set.size === state.discoveredIds.length) return state;
  return { discoveredIds: Array.from(set) };
}

/** Auto-discover every card the player level has reached (unlockLevel <= level). */
export function discoverByLevel(
  state: DiscoveryState,
  cards: CardDefinition[],
  level: number,
): DiscoveryState {
  if (!DISCOVERY_CONFIG.discoverByLevelUp) return state;
  const eligible = cards.filter((c) => c.unlockLevel <= level).map((c) => c.id);
  return discoverCards(state, eligible);
}

/**
 * Deterministic fight-based drip. Given a fight counter, picks a small set
 * of new discoveries weighted by rarity. Used by post-fight pipeline.
 */
export function discoverByFightCount(
  state: DiscoveryState,
  cards: CardDefinition[],
  totalFights: number,
  playerLevel: number,
): DiscoveryState {
  const interval = DISCOVERY_CONFIG.discoverFightInterval;
  if (!interval || totalFights === 0 || totalFights % interval !== 0) return state;

  const candidates = cards.filter(
    (c) => !state.discoveredIds.includes(c.id) && c.unlockLevel <= playerLevel + 3,
  );
  if (candidates.length === 0) return state;

  // Seed: use totalFights so it's stable per fight count.
  const seed = totalFights * 2654435761;
  const rng = mulberry32(seed >>> 0);

  const picks: string[] = [];
  for (const card of candidates) {
    const weight = DISCOVERY_CONFIG.fightDiscoveryRarityWeight[card.rarity];
    if (weight <= 0) continue;
    if (rng() < weight * 0.08) {
      picks.push(card.id);
      if (picks.length >= 2) break;
    }
  }
  return discoverCards(state, picks);
}

/** Public projection used by UI: a card paired with its computed visibility. */
export type VisibleCard = {
  card: CardDefinition;
  visibility: CardVisibility;
  owned?: OwnedCard;
};

export function projectCards(
  cards: CardDefinition[],
  owned: Record<string, OwnedCard>,
  discovery: DiscoveryState,
  options?: { includeUnseen?: boolean },
): VisibleCard[] {
  const includeUnseen = options?.includeUnseen ?? true;
  const out: VisibleCard[] = [];
  for (const card of cards) {
    const visibility = getCardVisibility(card, owned, discovery);
    if (!includeUnseen && visibility === 'unseen') continue;
    out.push({ card, visibility, owned: owned[card.id] });
  }
  return out;
}

// --- internal RNG (tiny PRNG, kept local so this service stays self-contained) ---
function mulberry32(seed: number) {
  let a = seed || 1;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
