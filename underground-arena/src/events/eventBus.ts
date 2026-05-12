type EventMap = {
  OnFightWon: { fightId: string };
  OnCardUnlocked: { cardId: string };
  OnLevelUp: { newLevel: number };
  OnTournamentCompleted: { tournamentId: string };
};

type Handler<K extends keyof EventMap> = (payload: EventMap[K]) => void;

class EventBus {
  private handlers: { [K in keyof EventMap]?: Handler<K>[] } = {};

  on<K extends keyof EventMap>(event: K, handler: Handler<K>) {
    const list = (this.handlers[event] ?? []) as Handler<K>[];
    list.push(handler);
    this.handlers[event] = list as never;

    return () => {
      this.handlers[event] = list.filter((h) => h !== handler) as never;
    };
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    const list = (this.handlers[event] ?? []) as Handler<K>[];
    list.forEach((handler) => handler(payload));
  }
}

export const eventBus = new EventBus();
