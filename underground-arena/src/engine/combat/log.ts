import type { CombatEvent, CombatEventType } from './types';

export function buildEvent(
  type: CombatEventType,
  turn: number,
  message: string,
  extras: Partial<CombatEvent> = {},
): CombatEvent {
  return { type, turn, message, ...extras };
}
