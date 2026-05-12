import { create } from 'zustand';
import { CARD_DEFINITIONS } from '@/data/cards';
import { getObject, setObject } from '@/services/persistence/storage';
import { storageKeys } from '@/services/persistence/keys';
import { applyCardFilters, applyCardSort, validateDeck } from '@/services/cards/cardUtils';
import { openPack, type PackType } from '@/services/cards/packSystem';
import type { CardDefinition, CardFilter, CardSort, DeckPreset, OwnedCard } from '@/types/cards';

type UpgradeCost = {
  coins: number;
  duplicates: number;
};

type CardsState = {
  cards: CardDefinition[];
  owned: Record<string, OwnedCard>;
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
  getVisibleCards: () => CardDefinition[];
};

type CardsPersisted = Pick<CardsState, 'owned' | 'decks' | 'packHistory'>;

const STARTER_DECK: DeckPreset = {
  id: 'starter',
  name: 'Starter Deck',
  cardIds: ['punch_jab_01', 'kick_low_01', 'grapple_clinch_01', 'defense_shell_01'],
  updatedAt: Date.now(),
};

const initialOwned: Record<string, OwnedCard> = {
  punch_jab_01: { cardId: 'punch_jab_01', quantity: 1, level: 1, favorite: false, acquiredAt: Date.now() },
  kick_low_01: { cardId: 'kick_low_01', quantity: 1, level: 1, favorite: false, acquiredAt: Date.now() },
  grapple_clinch_01: { cardId: 'grapple_clinch_01', quantity: 1, level: 1, favorite: false, acquiredAt: Date.now() },
  defense_shell_01: { cardId: 'defense_shell_01', quantity: 1, level: 1, favorite: false, acquiredAt: Date.now() },
};

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: CARD_DEFINITIONS,
  owned: initialOwned,
  decks: [STARTER_DECK],
  packHistory: [],
  filter: {},
  sort: 'alphabetical',

  hydrate: async () => {
    const persisted = await getObject<CardsPersisted>(storageKeys.cards);
    if (!persisted) return;
    set({ owned: persisted.owned, decks: persisted.decks, packHistory: persisted.packHistory });
  },

  unlockCard: async (cardId, qty = 1) => {
    const owned = { ...get().owned };
    const current = owned[cardId];
    owned[cardId] = current
      ? { ...current, quantity: current.quantity + qty }
      : { cardId, quantity: qty, level: 1, favorite: false, acquiredAt: Date.now() };
    set({ owned });
    await setObject(storageKeys.cards, { owned, decks: get().decks, packHistory: get().packHistory });
  },

  toggleFavorite: async (cardId) => {
    const owned = { ...get().owned };
    if (!owned[cardId]) return;
    owned[cardId] = { ...owned[cardId], favorite: !owned[cardId].favorite };
    set({ owned });
    await setObject(storageKeys.cards, { owned, decks: get().decks, packHistory: get().packHistory });
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
    const decks = [...get().decks.filter((d) => d.id !== deck.id), { ...deck, updatedAt: Date.now() }];
    set({ decks });
    await setObject(storageKeys.cards, { owned: get().owned, decks, packHistory: get().packHistory });
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
    const packHistory = [...get().packHistory, { pack, cardIds: rewards.map((r) => r.id), openedAt: Date.now() }];
    set({ owned, packHistory });
    await setObject(storageKeys.cards, { owned, decks: get().decks, packHistory });
    return rewards.map((r) => r.id);
  },

  getVisibleCards: () => {
    const state = get();
    return applyCardSort(applyCardFilters(state.cards, state.owned, state.filter), state.owned, state.sort);
  },
}));
