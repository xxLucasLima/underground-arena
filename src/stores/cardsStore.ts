import { create } from 'zustand';

type CardsState = {
  ownedCardIds: string[];
};

export const useCardsStore = create<CardsState>(() => ({
  ownedCardIds: [],
}));
