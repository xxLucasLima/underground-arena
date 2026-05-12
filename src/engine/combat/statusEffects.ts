import type { CardDefinition, StatusEffectType } from '@/types/cards';
import type { ActiveStatusEffect, CombatEvent, FighterRuntime } from './types';

export type StatusBehavior = {
  onApply?: (target: FighterRuntime, effect: ActiveStatusEffect) => FighterRuntime;
  onTurnStart?: (target: FighterRuntime, effect: ActiveStatusEffect) => { runtime: FighterRuntime; events: CombatEvent[] };
};

export const STATUS_BEHAVIORS: Record<NonNullable<StatusEffectType>, StatusBehavior> = {
  bleeding: {
    onTurnStart: (target, effect) => ({
      runtime: { ...target, hp: Math.max(0, target.hp - effect.magnitude) },
      events: [
        {
          type: 'damageDealt',
          turn: 0,
          targetId: target.id,
          amount: effect.magnitude,
          message: `${target.id} bleeds for ${effect.magnitude}`,
        },
      ],
    }),
  },
  stun: {},
  exhaustion: {
    onTurnStart: (target, effect) => ({
      runtime: { ...target, stamina: Math.max(0, target.stamina - effect.magnitude) },
      events: [],
    }),
  },
  adrenaline: {},
  defense_break: {},
  stamina_burn: {
    onApply: (target, effect) => ({ ...target, stamina: Math.max(0, target.stamina - effect.magnitude) }),
  },
  combo_boost: {},
  accuracy_reduction: {},
};

export function applyStatusFromCard(target: FighterRuntime, card: CardDefinition): { runtime: FighterRuntime; applied?: ActiveStatusEffect } {
  if (!card.statusEffect) return { runtime: target };
  const effect: ActiveStatusEffect = {
    type: card.statusEffect,
    remaining: card.duration || 1,
    magnitude: Math.max(1, Math.round(card.damage * 0.15)),
    sourceCardId: card.id,
  };
  const behavior = STATUS_BEHAVIORS[effect.type];
  const afterApply = behavior?.onApply ? behavior.onApply(target, effect) : target;
  return { runtime: { ...afterApply, effects: [...afterApply.effects, effect] }, applied: effect };
}

export function tickEffects(target: FighterRuntime, turn: number): { runtime: FighterRuntime; events: CombatEvent[] } {
  const events: CombatEvent[] = [];
  let runtime = target;
  const remainingEffects: ActiveStatusEffect[] = [];

  for (const effect of runtime.effects) {
    const behavior = STATUS_BEHAVIORS[effect.type];
    if (behavior?.onTurnStart) {
      const result = behavior.onTurnStart(runtime, effect);
      runtime = result.runtime;
      result.events.forEach((e) => events.push({ ...e, turn }));
    }
    const next = { ...effect, remaining: effect.remaining - 1 };
    if (next.remaining > 0) {
      remainingEffects.push(next);
    } else {
      events.push({
        type: 'statusExpired',
        turn,
        targetId: runtime.id,
        status: effect.type,
        message: `${effect.type} expired on ${runtime.id}`,
      });
    }
  }

  return { runtime: { ...runtime, effects: remainingEffects }, events };
}

export function hasStatus(runtime: FighterRuntime, type: NonNullable<StatusEffectType>) {
  return runtime.effects.some((e) => e.type === type);
}
