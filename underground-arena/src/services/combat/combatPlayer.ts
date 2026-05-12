import { combatEventToCues } from '@/feedback/combatToFeedback';
import { feedbackBus } from '@/feedback/feedbackBus';
import type { FeedbackCue } from '@/feedback/types';
import type {
  ActiveStatusEffect,
  CombatEvent,
  CombatState,
  FighterRuntime,
} from '@/engine/combat/types';
import { DEFAULT_COMBAT_CONFIG } from '@/engine/combat/types';
import { staminaRegen } from '@/engine/combat/stats';

/**
 * Plays a finished CombatState's event log back as a paced stream of
 * FeedbackCues + per-tick `onState` snapshots.
 *
 * Why post-hoc playback (vs streaming a live engine):
 *  - The engine is deterministic & seeded. Resolving the full match up-front
 *    is the source of truth, and replaying gives us a uniform animation
 *    pipeline whether the match is local, recorded, or rivals AI vs AI.
 *  - We can pause / speed up / cancel without touching engine state.
 *
 * Each "tick" we:
 *  1. emit any FeedbackCues mapped from the current CombatEvent,
 *  2. expose a *reconstructed* state snapshot up to that event so HUD bars
 *     (HP / stamina) animate progressively rather than staying pinned to
 *     final values,
 *  3. await a delay tuned to the event class (hits dwell longer than chatter).
 *
 * The screen owns the View; this service owns timing + dispatch.
 */
export type PlaybackOptions = {
  state: CombatState;
  events: CombatEvent[];
  playerId: string;
  /** Speed multiplier — 1 = normal, 2 = fast-forward, 0.5 = slow-mo. */
  speed?: number;
  /** Called for each event with the snapshot reconstructed *up to* that event. */
  onState?: (snapshot: CombatState) => void;
  onCue?: (cue: FeedbackCue) => void;
  onDone?: () => void;
};

/**
 * Per-event base dwell. Tuned for *readability* on mobile:
 *  - cardPlayed is the longest beat (anticipation): players must read the move
 *    banner before the damage lands.
 *  - damageDealt / critical sit a beat longer than the impact animation so
 *    the floating number is parseable.
 *  - Stagger / counter get extra recovery space — they're tactical inflection
 *    points the player should feel.
 *  - Status events used to fire in <100ms bursts and felt like noise; bumped
 *    to ~360ms so the toast stack is actually readable.
 *
 * If a fight feels rushed/slow, tune *only* this table. Speed multiplier on
 * `startPlayback` still works on top (fast-forward / replay scrubbing).
 */
const EVENT_DURATION_MS: Partial<Record<CombatEvent['type'], number>> = {
  matchStart: 320,
  roundStart: 140,
  // Anticipation: the move banner needs ~half a second of read time before
  // the resulting damageDealt event lands. Rarity adds more on top (below).
  cardPlayed: 520,
  // Impact + parse time. The hit flash + floating number need both to be
  // visible in the same beat.
  damageDealt: 520,
  critical: 760,
  combo: 340,
  // Recovery beat — countering is a key tactical moment.
  counter: 560,
  statusApplied: 360,
  statusExpired: 200,
  staminaChange: 120,
  stagger: 480,
  // KO / submission are cinematic; KOOverlay handles its own dwell on top.
  knockout: 1100,
  submission: 1100,
  matchEnd: 360,
};

/**
 * Extra dwell on `cardPlayed` based on rarity, so the move banner has time to
 * read before the resulting `damageDealt` event lands. Legendary moves should
 * feel like a *moment* — they linger noticeably longer.
 */
const RARITY_DWELL_MS: Record<string, number> = {
  Common: 0,
  Rare: 200,
  Epic: 480,
  Legendary: 900,
};

/**
 * Recovery padding added *after* impactful events so the next move doesn't
 * crowd the current one. Keeps combat readable without slowing chatter
 * events (status expiration, stamina ticks).
 */
const RECOVERY_MS: Partial<Record<CombatEvent['type'], number>> = {
  critical: 260,
  knockout: 320,
  submission: 320,
  stagger: 160,
  counter: 200,
};

export function startPlayback(opts: PlaybackOptions): { cancel: () => void } {
  const speed = Math.max(0.1, opts.speed ?? 1);
  let cancelled = false;
  let i = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  // Seed runtime state at full HP / full stamina; we'll mutate copies as we
  // walk the event log so the UI reflects the actual current values.
  const runtimes: Record<string, FighterRuntime> = {};
  for (const id of Object.keys(opts.state.profiles)) {
    const profile = opts.state.profiles[id];
    runtimes[id] = {
      id,
      hp: profile.maxHp,
      stamina: profile.maxStamina,
      comboMomentum: 0,
      cooldowns: {},
      effects: [],
      staggered: false,
      defeated: false,
      finisher: null,
      recentCardIds: [],
      recentCategories: [],
      turnsSinceCritical: 0,
    };
  }

  const tick = () => {
    if (cancelled) return;
    if (i >= opts.events.length) {
      opts.onDone?.();
      return;
    }
    const event = opts.events[i];
    applyEventToRuntimes(event, runtimes, opts.state);

    const cues = combatEventToCues(event, opts.state, opts.playerId);
    for (const c of cues) {
      feedbackBus.emit(c);
      opts.onCue?.(c);
    }

    opts.onState?.({
      ...opts.state,
      turn: event.turn || opts.state.turn,
      activeFighterId: event.actorId ?? opts.state.activeFighterId,
      fighters: cloneRuntimes(runtimes),
      log: opts.events.slice(0, i + 1),
      // winnerId/finished only set by the *final* matchEnd event so UI doesn't
      // prematurely show victory overlays.
      winnerId: event.type === 'matchEnd' ? opts.state.winnerId : null,
      finished: event.type === 'matchEnd',
    });

    let dwell = EVENT_DURATION_MS[event.type] ?? 200;
    if (event.type === 'cardPlayed' && event.actorId && event.cardId) {
      const card = opts.state.profiles[event.actorId]?.deck.find(
        (c) => c.id === event.cardId,
      );
      if (card) {
        dwell += RARITY_DWELL_MS[card.rarity] ?? 0;
        // Ultimates get an extra cinematic beat regardless of rarity.
        if (card.category === 'Ultimate') dwell += 300;
      }
    }
    // Scale damage dwell by magnitude so big hits visibly land harder.
    if (event.type === 'damageDealt' && (event.amount ?? 0) >= 22) {
      dwell += 180;
    }
    dwell += RECOVERY_MS[event.type] ?? 0;
    const duration = dwell / speed;
    timer = setTimeout(() => {
      timer = null;
      i += 1;
      tick();
    }, duration);
  };

  tick();
  return {
    cancel: () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}

function cloneRuntimes(
  src: Record<string, FighterRuntime>,
): Record<string, FighterRuntime> {
  const out: Record<string, FighterRuntime> = {};
  for (const id of Object.keys(src)) {
    const r = src[id];
    out[id] = { ...r, effects: r.effects.map((e) => ({ ...e })) };
  }
  return out;
}

/**
 * Mutates `runtimes` to reflect the effect of `event`. Intentionally a small
 * subset of engine behavior — we only need the values the HUD reads:
 *   • HP (damageDealt, critical)
 *   • Stamina (staminaChange)
 *   • Defeated/finisher (knockout, submission)
 *   • Active status effects (statusApplied, statusExpired)
 *
 * Everything else (cooldowns, AI memory) the screen never displays, so we
 * skip it to keep this hot path allocation-free per event.
 */
function applyEventToRuntimes(
  event: CombatEvent,
  runtimes: Record<string, FighterRuntime>,
  state: CombatState,
): void {
  switch (event.type) {
    case 'roundStart': {
      // The engine regenerates stamina + decays cooldowns at the *start* of
      // each round for the active fighter. The event log doesn't emit a
      // dedicated `staminaChange` for regen, so we mirror that math here so
      // the HUD stamina bar visibly ticks back up between turns.
      if (!event.actorId) return;
      const r = runtimes[event.actorId];
      const profile = state.profiles[event.actorId];
      if (!r || !profile) return;
      const regen = staminaRegen(
        profile.stats,
        DEFAULT_COMBAT_CONFIG.staminaRegenPerTurn,
      );
      r.stamina = Math.min(profile.maxStamina, r.stamina + regen);
      break;
    }
    case 'cardPlayed': {
      // Engine deducts `card.staminaCost` when a card is played but never
      // emits a `staminaChange` event for it — without mirroring that here
      // the player's stamina bar would stay pinned at max for the whole
      // fight. We look up the card on the actor's deck (always present in
      // CombatState.profiles) and subtract its cost.
      if (!event.actorId || !event.cardId) return;
      const r = runtimes[event.actorId];
      const profile = state.profiles[event.actorId];
      if (!r || !profile) return;
      const card = profile.deck.find((c) => c.id === event.cardId);
      if (!card) return;
      r.stamina = Math.max(0, r.stamina - card.staminaCost);
      break;
    }
    case 'damageDealt':
    case 'critical': {
      if (!event.targetId) return;
      const r = runtimes[event.targetId];
      if (!r) return;
      r.hp = Math.max(0, r.hp - (event.amount ?? 0));
      break;
    }
    case 'staminaChange': {
      const id = event.targetId ?? event.actorId;
      if (!id) return;
      const r = runtimes[id];
      if (!r) return;
      r.stamina = Math.max(0, r.stamina + (event.amount ?? 0));
      break;
    }
    case 'knockout': {
      if (!event.targetId) return;
      const r = runtimes[event.targetId];
      if (!r) return;
      r.hp = 0;
      r.defeated = true;
      r.finisher = 'KO';
      break;
    }
    case 'submission': {
      if (!event.targetId) return;
      const r = runtimes[event.targetId];
      if (!r) return;
      r.defeated = true;
      r.finisher = 'Submission';
      break;
    }
    case 'stagger': {
      if (!event.targetId) return;
      const r = runtimes[event.targetId];
      if (!r) return;
      r.staggered = true;
      break;
    }
    case 'statusApplied': {
      if (!event.targetId || !event.status) return;
      const r = runtimes[event.targetId];
      if (!r) return;
      const next: ActiveStatusEffect = {
        type: event.status,
        remaining: event.amount ?? 2,
        magnitude: 1,
        sourceCardId: event.cardId ?? '',
      };
      r.effects = [...r.effects.filter((e) => e.type !== event.status), next];
      break;
    }
    case 'statusExpired': {
      if (!event.targetId || !event.status) return;
      const r = runtimes[event.targetId];
      if (!r) return;
      r.effects = r.effects.filter((e) => e.type !== event.status);
      break;
    }
    default:
      break;
  }
}
