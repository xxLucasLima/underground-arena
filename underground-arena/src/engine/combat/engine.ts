import { executeCard } from './cardPipeline';
import { buildEvent } from './log';
import { createRng, type RNG } from './rng';
import { regenerateStamina } from './stamina';
import { tickEffects } from './statusEffects';
import {
  type CombatConfig,
  type CombatEvent,
  type CombatState,
  type FighterProfile,
  type FighterRuntime,
  DEFAULT_COMBAT_CONFIG,
} from './types';
import { pickCard } from './ai/decide';

export function createFighterRuntime(profile: FighterProfile): FighterRuntime {
  return {
    id: profile.id,
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

export function createCombatState(args: {
  playerProfile: FighterProfile;
  opponentProfile: FighterProfile;
}): CombatState {
  const player = createFighterRuntime(args.playerProfile);
  const opponent = createFighterRuntime(args.opponentProfile);
  return {
    turn: 0,
    activeFighterId: args.playerProfile.id,
    fighters: { [player.id]: player, [opponent.id]: opponent },
    profiles: { [args.playerProfile.id]: args.playerProfile, [args.opponentProfile.id]: args.opponentProfile },
    log: [buildEvent('matchStart', 0, `${args.playerProfile.name} vs ${args.opponentProfile.name}`)],
    winnerId: null,
    finished: false,
  };
}

function reduceCooldowns(runtime: FighterRuntime): FighterRuntime {
  const next: Record<string, number> = {};
  Object.entries(runtime.cooldowns).forEach(([id, val]) => {
    if (val > 1) next[id] = val - 1;
  });
  return { ...runtime, cooldowns: next };
}

/**
 * Advances the combat by exactly one turn (active fighter takes one action).
 * Pure: returns a new state. No persistence/UI dependencies.
 */
export function advanceTurn(state: CombatState, rng: RNG, config: CombatConfig = DEFAULT_COMBAT_CONFIG): CombatState {
  if (state.finished) return state;

  const turn = state.turn + 1;
  const events: CombatEvent[] = [buildEvent('roundStart', turn, `Round ${turn} start`)];

  const attackerId = state.activeFighterId;
  const defenderId = Object.keys(state.fighters).find((id) => id !== attackerId)!;
  let attacker = state.fighters[attackerId];
  let defender = state.fighters[defenderId];
  const attackerProfile = state.profiles[attackerId];
  const defenderProfile = state.profiles[defenderId];

  // Tick effects on attacker at turn start
  const attackerTick = tickEffects(attacker, turn);
  attacker = attackerTick.runtime;
  events.push(...attackerTick.events);

  // Stamina regen + cooldown decay before action
  attacker = reduceCooldowns(regenerateStamina(attacker, attackerProfile, config.staminaRegenPerTurn));

  // Skip if attacker is staggered (lose action, recover next turn)
  if (attacker.staggered) {
    attacker = { ...attacker, staggered: false };
    events.push(buildEvent('stagger', turn, `${attackerProfile.name} recovers from stagger`));
  } else {
    const card = pickCard(attackerProfile, attacker, defender, rng);
    if (card) {
      const result = executeCard({
        rng,
        turn,
        config,
        attackerProfile,
        defenderProfile,
        attacker,
        defender,
        card,
      });
      attacker = result.attacker;
      defender = result.defender;
      attacker = {
        ...attacker,
        recentCardIds: [...attacker.recentCardIds, card.id].slice(-4),
        recentCategories: [...attacker.recentCategories, card.category].slice(-4),
        turnsSinceCritical: result.events.some((e) => e.type === 'critical')
          ? 0
          : attacker.turnsSinceCritical + 1,
      };
      events.push(...result.events);
    } else {
      events.push(buildEvent('cardPlayed', turn, `${attackerProfile.name} has no playable cards`));
    }
  }

  const finished = defender.defeated || turn >= config.maxTurns;
  const winnerId = defender.defeated
    ? attackerId
    : turn >= config.maxTurns
      ? attacker.hp >= defender.hp
        ? attackerId
        : defenderId
      : null;

  if (finished) {
    events.push(buildEvent('matchEnd', turn, `Match end. Winner: ${winnerId ?? 'draw'}`));
  }

  return {
    turn,
    activeFighterId: defenderId,
    fighters: { [attackerId]: attacker, [defenderId]: defender },
    profiles: state.profiles,
    log: [...state.log, ...events],
    winnerId,
    finished,
  };
}

/**
 * Runs the full match to completion using a seedable RNG. Deterministic.
 */
export function runMatch(args: {
  seed: number;
  playerProfile: FighterProfile;
  opponentProfile: FighterProfile;
  config?: CombatConfig;
}): CombatState {
  const rng = createRng(args.seed);
  let state = createCombatState({ playerProfile: args.playerProfile, opponentProfile: args.opponentProfile });
  const config = args.config ?? DEFAULT_COMBAT_CONFIG;
  while (!state.finished) {
    state = advanceTurn(state, rng, config);
  }
  return state;
}
