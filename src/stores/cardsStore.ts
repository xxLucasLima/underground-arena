import { create } from 'zustand';
import { CARD_DEFINITIONS } from '@/data/cards';
import { DISCOVERY_CONFIG } from '@/data/cards/discoveryConfig';
import { getObject, setObject } from '@/services/persistence/storage';
import { storageKeys } from '@/services/persistence/keys';
import { applyCardFilters, applyCardSort, validateDeck } from '@/services/cards/cardUtils';
import { openPack, type PackType } from '@/services/cards/packSystem';
import {
  createInitialDiscovery,
  discoverByFightCount,
  discoverByLevel,
  discoverCards,
  getCardVisibility,
  projectCards,
  type DiscoveryState,
  type VisibleCard,
} from '@/services/cards/discovery';
import type {
  CardDefinition,
  CardFilter,
  CardSort,
  CardVisibility,
  DeckPreset,
  OwnedCard,
} from '@/types/cards';

type UpgradeCost = {
  coins: number;
  duplicates: number;
};

type CardsState = {
  cards: CardDefinition[];
  owned: Record<string, OwnedCard>;
  discovery: DiscoveryState;
  decks: DeckPreset[];
  packHistory: Array<{ pack: PackType; cardIds: string[]; openedAt: number }>;
  filter: CardFilter;
  sort: CardSort;
  hydrate: () => Promise<void>;
  unlockCard: (cardId: string, qty?: number) => Promise<void>;
  toggleFavorite: (cardId: string) => Promise<void>;
  setFilter: (filter: CardFilter) => void;
  setSort: (sort: CardSort) => void;
  getUpgradeCost: (cardId: string) => UpgradeCost;
  canUpgradeCard: (cardId: string, coins: number) => { ok: boolean; reason?: string; cost: UpgradeCost };
  saveDeck: (deck: DeckPreset) => Promise<{ ok: boolean; reason?: string }>;
  openPackAndCollect: (pack: PackType) => Promise<string[]>;
  /** Reveal arbitrary cards (e.g. tutorial reward, achievement). */
  discover: (ids: string[]) => Promise<string[]>;
  /** Reveal everything unlocked at or below this level. */
  discoverUpToLevel: (level: number) => Promise<string[]>;
  /** Called by post-fight pipeline; deterministic drip based on totalFights. */
  rollFightDiscoveries: (totalFights: number, playerLevel: number) => Promise<string[]>;
  /** UI-facing: returns visibility-aware cards (filter & sort applied). */
  getVisibleCards: () => VisibleCard[];
  getVisibility: (cardId: string) => CardVisibility;
};

type CardsPersisted = Pick<CardsState, 'owned' | 'decks' | 'packHistory'> & {
  discovery: DiscoveryState;
};

const STARTER_DECK: DeckPreset = {
  id: 'starter',
  name: 'Starter Deck',
  cardIds: ['punch_jab_01', 'kick_low_01', 'grapple_clinch_01', 'defense_shell_01'],
  updatedAt: Date.now(),
};

function buildInitialOwned(): Record<string, OwnedCard> {
  const out: Record<string, OwnedCard> = {};
  const now = Date.now();
  DISCOVERY_CONFIG.initialOwnedIds.forEach((id) => {
    out[id] = { cardId: id, quantity: 1, level: 1, favorite: false, acquiredAt: now };
  });
  return out;
}

async function persist(state: CardsState) {
  const payload: CardsPersisted = {
    owned: state.owned,
    decks: state.decks,
    packHistory: state.packHistory,
    discovery: state.discovery,
  };
  await setObject(storageKeys.cards, payload);
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: CARD_DEFINITIONS,
  owned: buildInitialOwned(),
  discovery: createInitialDiscovery(),
  decks: [STARTER_DECK],
  packHistory: [],
  filter: {},
  sort: 'alphabetical',

  hydrate: async () => {
    const persisted = await getObject<CardsPersisted>(storageKeys.cards);
    if (!persisted) return;
    set({
      owned: persisted.owned,
      decks: persisted.decks,
      packHistory: persisted.packHistory,
      discovery: persisted.discovery ?? createInitialDiscovery(),
    });
  },

  unlockCard: async (cardId, qty = 1) => {
    const owned = { ...get().owned };
    const current = owned[cardId];
    owned[cardId] = current
      ? { ...current, quantity: current.quantity + qty }
      : { cardId, quantity: qty, level: 1, favorite: false, acquiredAt: Date.now() };
    // Ensure ownership implies discovery — single source of truth in the service.
    const discovery = discoverCards(get().discovery, [cardId]);
    set({ owned, discovery });
    await persist(get());
  },

  toggleFavorite: async (cardId) => {
    const owned = { ...get().owned };
    if (!owned[cardId]) return;
    owned[cardId] = { ...owned[cardId], favorite: !owned[cardId].favorite };
    set({ owned });
    await persist(get());
  },

  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),

  getUpgradeCost: (cardId) => {
    const owned = get().owned[cardId];
    const level = owned?.level ?? 1;
    return {
      coins: 100 + level * 80,
      duplicates: Math.max(1, Math.floor(level / 2) + 1),
    };
  },

  canUpgradeCard: (cardId, coins) => {
    const owned = get().owned[cardId];
    const cost = get().getUpgradeCost(cardId);
    if (!owned) return { ok: false, reason: 'Card not owned', cost };
    if (coins < cost.coins) return { ok: false, reason: 'Not enough coins', cost };
    if (owned.quantity <= cost.duplicates) return { ok: false, reason: 'Not enough duplicates', cost };
    return { ok: true, cost };
  },

  saveDeck: async (deck) => {
    const validation = validateDeck(deck, get().cards);
    if (!validation.valid) return { ok: false, reason: validation.reason };
    // Block decks containing un-owned cards (deck builder filters anyway).
    const owned = get().owned;
    const missing = deck.cardIds.find((id) => !owned[id]);
    if (missing) return { ok: false, reason: 'Deck contains un-owned cards' };
    const decks = [...get().decks.filter((d) => d.id !== deck.id), { ...deck, updatedAt: Date.now() }];
    set({ decks });
    await persist(get());
    return { ok: true };
  },

  openPackAndCollect: async (pack) => {
    const rewards = openPack(pack);
    const owned = { ...get().owned };
    rewards.forEach((r) => {
      const current = owned[r.id];
      owned[r.id] = current
        ? { ...current, quantity: current.quantity + 1 }
        : { cardId: r.id, quantity: 1, level: 1, favorite: false, acquiredAt: Date.now() };
    });
    const discovery = discoverCards(get().discovery, rewards.map((r) => r.id));
    const packHistory = [...get().packHistory, { pack, cardIds: rewards.map((r) => r.id), openedAt: Date.now() }];
    set({ owned, packHistory, discovery });
    await persist(get());
    return rewards.map((r) => r.id);
  },

  discover: async (ids) => {
    const before = get().discovery.discoveredIds.length;
    const discovery = discoverCards(get().discovery, ids);
    set({ discovery });
    await persist(get());
    return discovery.discoveredIds.slice(before);
  },

  discoverUpToLevel: async (level) => {
    const before = new Set(get().discovery.discoveredIds);
    const discovery = discoverByLevel(get().discovery, get().cards, level);
    set({ discovery });
    await persist(get());
    return discovery.discoveredIds.filter((id) => !before.has(id));
  },

  rollFightDiscoveries: async (totalFights, playerLevel) => {
    const before = new Set(get().discovery.discoveredIds);
    const discovery = discoverByFightCount(get().discovery, get().cards, totalFights, playerLevel);
    if (discovery === get().discovery) return [];
    set({ discovery });
    await persist(get());
    return discovery.discoveredIds.filter((id) => !before.has(id));
  },

  getVisibleCards: () => {
    const state = get();
    // 1. Project all cards through the visibility service.
    const projected = projectCards(state.cards, state.owned, state.discovery, { includeUnseen: true });
    // 2. Apply existing filters (rarity / category / owned-only / favorites) to underlying definitions.
    const filteredDefs = applyCardFilters(
      projected.map((p) => p.card),
      state.owned,
      state.filter,
    );
    const filteredIds = new Set(filteredDefs.map((c) => c.id));
    // 3. Sort using existing sort utility, then re-pair with visibility.
    const sortedDefs = applyCardSort(
      projected.filter((p) => filteredIds.has(p.card.id)).map((p) => p.card),
      state.owned,
      state.sort,
    );
    const byId = new Map(projected.map((p) => [p.card.id, p]));
    return sortedDefs.map((c) => byId.get(c.id)!).filter(Boolean);
  },

  getVisibility: (cardId) => {
    const card = get().cards.find((c) => c.id === cardId);
    if (!card) return 'unseen';
    return getCardVisibility(card, get().owned, get().discovery);
  },
}));
