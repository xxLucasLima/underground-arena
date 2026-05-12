import type { CombatEvent, CombatState } from '@/engine/combat/types';
import type { FeedbackCue, FeedbackImpact, FeedbackTarget } from './types';

/**
 * Adapter: pure function from a CombatEvent (engine layer) to zero or more
 * FeedbackCues (UI layer).
 *
 * Game-feel philosophy: keep the adapter *opinionated*. The engine doesn't know
 * what "heavy" means visually, so we map damage thresholds here. Tweak this
 * file to retune the entire feel of combat without touching engine code.
 *
 * Performance: stays a pure switch — no allocations beyond the returned array.
 */
export function combatEventToCues(
  event: CombatEvent,
  state: CombatState,
  playerId: string,
): FeedbackCue[] {
  const targetOf = (id?: string): FeedbackTarget =>
    id === playerId ? 'player' : 'opponent';

  switch (event.type) {
    case 'matchStart':
      return [{ kind: 'matchStart' }];

    case 'cardPlayed': {
      // Resolve card metadata from the actor's deck. Card definitions live in
      // the engine layer (deck on FighterProfile), so we never depend on the
      // global card db here — keeps replays self-contained.
      if (!event.cardId || !event.actorId) return [];
      const profile = state.profiles[event.actorId];
      const card = profile?.deck.find((c) => c.id === event.cardId);
      if (!card) return [];
      return [
        {
          kind: 'move',
          target: targetOf(event.actorId),
          cardId: card.id,
          name: card.name,
          icon: card.icon,
          rarity: card.rarity,
          category: card.category,
          isUltimate: card.category === 'Ultimate',
        },
      ];
    }

    case 'damageDealt': {
      const dmg = event.amount ?? 0;
      // Zero-damage damageDealt = attack didn't connect. The engine logs
      // this both for accuracy-roll misses *and* for defensive outcomes
      // (Defense category cards typically deal 0). We distinguish by:
      //  - message contains "evaded" → dodge
      //  - attacker card category Defense → parry / block by target's gear
      //  - otherwise → generic miss
      // This keeps the engine free of UI-only enumerations.
      if (dmg <= 0) {
        const isEvaded = /evaded/i.test(event.message ?? '');
        // `target` for the badge is the *defender* (event.targetId), which
        // matches our convention: defense cues show on the side that *avoided*
        // the attack.
        return [
          {
            kind: 'defense',
            target: targetOf(event.targetId),
            outcome: isEvaded ? 'dodge' : 'miss',
          },
        ];
      }
      const impact: FeedbackImpact =
        dmg >= 22 ? 'heavy' : dmg >= 12 ? 'medium' : 'light';
      return [
        { kind: 'hit', target: targetOf(event.targetId), impact, damage: dmg },
      ];
    }

    case 'critical': {
      const dmg = event.amount ?? 0;
      return [
        { kind: 'critical', target: targetOf(event.targetId), damage: dmg },
        // Criticals also escalate the "hit" feedback so callers that only
        // listen for hits still feel the spike.
        { kind: 'hit', target: targetOf(event.targetId), impact: 'critical', damage: dmg, critical: true },
      ];
    }

    case 'combo': {
      return [{ kind: 'combo', target: targetOf(event.actorId), count: event.amount ?? 2 }];
    }

    case 'counter':
      // Emit both: `counter` for audio/haptic listeners, and a `defense`
      // badge so the player sees "COUNTERED" prominently. actorId is the
      // counter-attacker (the one defending against the original attack).
      return [
        { kind: 'counter', target: targetOf(event.actorId) },
        { kind: 'defense', target: targetOf(event.actorId), outcome: 'counter' },
      ];

    case 'stagger':
      return [{ kind: 'stagger', target: targetOf(event.targetId) }];

    case 'statusApplied':
      return event.status
        ? [{ kind: 'status', target: targetOf(event.targetId), status: event.status, applied: true }]
        : [];

    case 'statusExpired':
      return event.status
        ? [{ kind: 'status', target: targetOf(event.targetId), status: event.status, applied: false }]
        : [];

    case 'staminaChange':
      return [
        {
          kind: 'stamina',
          target: targetOf(event.targetId ?? event.actorId),
          delta: event.amount ?? 0,
        },
      ];

    case 'knockout':
      return [{ kind: 'ko', target: targetOf(event.targetId) }];

    case 'submission':
      return [{ kind: 'submission', target: targetOf(event.targetId) }];

    case 'matchEnd': {
      const winner =
        state.winnerId == null
          ? 'draw'
          : state.winnerId === playerId
          ? 'player'
          : 'opponent';
      return [{ kind: 'matchEnd', winner }];
    }

    default:
      return [];
  }
}

/**
 * Replay-friendly: feed an entire log to a consumer in order. Used by the
 * AnimatedCombatPlayer to drive playback over a finished CombatState.
 */
export function eventsToCues(
  events: CombatEvent[],
  state: CombatState,
  playerId: string,
): FeedbackCue[] {
  const out: FeedbackCue[] = [];
  for (const e of events) out.push(...combatEventToCues(e, state, playerId));
  return out;
}
