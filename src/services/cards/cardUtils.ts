import type { CardDefinition, CardFilter, CardSort, DeckPreset, OwnedCard } from '@/types/cards';

export function applyCardFilters(cards: CardDefinition[], owned: Record<string, OwnedCard>, filter: CardFilter) {
  return cards.filter((card) => {
    if (filter.rarity && card.rarity !== filter.rarity) return false;
    if (filter.category && card.category !== filter.category) return false;
    if (filter.ownedOnly && !owned[card.id]) return false;
    if (filter.favoritesOnly && !owned[card.id]?.favorite) return false;
    return true;
  });
}

const rarityWeight = { Common: 1, Rare: 2, Epic: 3, Legendary: 4 } as const;

export function applyCardSort(cards: CardDefinition[], owned: Record<string, OwnedCard>, sort: CardSort) {
  const copy = [...cards];
  copy.sort((a, b) => {
    switch (sort) {
      case 'rarity':
        return rarityWeight[b.rarity] - rarityWeight[a.rarity];
      case 'damage':
        return b.damage - a.damage;
      case 'cooldown':
        return a.cooldown - b.cooldown;
      case 'staminaCost':
        return a.staminaCost - b.staminaCost;
      case 'newest':
        return (owned[b.id]?.acquiredAt ?? 0) - (owned[a.id]?.acquiredAt ?? 0);
      case 'strongest':
        return b.damage + b.comboPotential - (a.damage + a.comboPotential);
      case 'alphabetical':
      default:
        return a.name.localeCompare(b.name);
    }
  });
  return copy;
}

export function validateDeck(deck: DeckPreset, cards: CardDefinition[]) {
  if (deck.cardIds.length > 8) return { valid: false, reason: 'Maximum 8 cards' };
  const ultimates = deck.cardIds.filter((id) => cards.find((c) => c.id === id)?.category === 'Ultimate').length;
  if (ultimates > 2) return { valid: false, reason: 'Maximum 2 ultimate cards' };
  return { valid: true as const };
}
