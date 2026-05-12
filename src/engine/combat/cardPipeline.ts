import type { CardDefinition } from '@/types/cards';
import { rollCombo } from './combos';
import { rollCritical } from './criticals';
import { buildEvent } from './log';
import { chance, type RNG } from './rng';
import { spendStamina } from './stamina';
import { applyStatusFromCard } from './statusEffects';
import { accuracyModifier, damageModifier, defenseModifier } from './stats';
import type { CombatConfig, CombatEvent, FighterProfile, FighterRuntime } from './types';
import { checkKnockout, checkSubmission } from './victory';

export type CardExecutionResult = {
  attacker: FighterRuntime;
  defender: FighterRuntime;
  events: CombatEvent[];
};

export function executeCard(args: {
  rng: RNG;
  turn: number;
  config: CombatConfig;
  attackerProfile: FighterProfile;
  defenderProfile: FighterProfile;
  attacker: FighterRuntime;
  defender: FighterRuntime;
  card: CardDefinition;
}): CardExecutionResult {
  const { rng, turn, config, attackerProfile, defenderProfile, card } = args;
  let attacker = spendStamina(args.attacker, card.staminaCost);
  let defender = args.defender;
  const events: CombatEvent[] = [];

  events.push(
    buildEvent('cardPlayed', turn, `${attackerProfile.name} plays ${card.name}`, {
      actorId: attackerProfile.id,
      targetId: defenderProfile.id,
      cardId: card.id,
    }),
  );

  const accuracy = card.accuracy + accuracyModifier(attackerProfile.stats, attacker, config.lowStaminaThreshold) - 100;
  const hits = chance(rng, Math.max(20, Math.min(99, accuracy)));
  if (!hits) {
    events.push(buildEvent('damageDealt', turn, `${defenderProfile.name} evaded ${card.name}`, { actorId: attackerProfile.id, targetId: defenderProfile.id, amount: 0 }));
    return { attacker: { ...attacker, cooldowns: { ...attacker.cooldowns, [card.id]: card.cooldown } }, defender, events };
  }

  const combo = rollCombo(rng, attackerProfile, attacker, card);
  if (combo.fired) {
    events.push(buildEvent('combo', turn, `${attackerProfile.name} chains a combo!`, { actorId: attackerProfile.id, amount: Math.round((combo.multiplier - 1) * 100) }));
  }
  attacker = { ...attacker, comboMomentum: combo.nextMomentum };

  const critical = rollCritical(rng, attackerProfile, attacker, card);
  if (critical.fired) {
    events.push(buildEvent('critical', turn, `Critical hit by ${attackerProfile.name}!`, { actorId: attackerProfile.id }));
  }

  const baseDamage = card.damage * damageModifier(attackerProfile.stats, attacker, config.lowStaminaThreshold);
  const mitigated = baseDamage * (1 - defenseModifier(defenderProfile.stats));
  const total = Math.max(0, Math.round(mitigated * combo.multiplier * critical.multiplier));

  defender = { ...defender, hp: Math.max(0, defender.hp - total) };
  events.push(
    buildEvent('damageDealt', turn, `${card.name} hits ${defenderProfile.name} for ${total}`, {
      actorId: attackerProfile.id,
      targetId: defenderProfile.id,
      cardId: card.id,
      amount: total,
    }),
  );

  if (card.statusEffect && chance(rng, card.statusEffectChance)) {
    const status = applyStatusFromCard(defender, card);
    defender = status.runtime;
    if (status.applied) {
      events.push(
        buildEvent('statusApplied', turn, `${status.applied.type} applied to ${defenderProfile.name}`, {
          actorId: attackerProfile.id,
          targetId: defenderProfile.id,
          status: status.applied.type,
        }),
      );
    }
  }

  // Submission check (before KO since submission ends fight by tap-out)
  if (checkSubmission(rng, attackerProfile, defender, card)) {
    defender = { ...defender, defeated: true, finisher: 'Submission' };
    events.push(buildEvent('submission', turn, `${defenderProfile.name} submits!`, { actorId: attackerProfile.id, targetId: defenderProfile.id }));
  } else {
    const ko = checkKnockout(rng, defenderProfile, defender, 0);
    if (defender.hp <= 0 || (ko.knockedOut && total >= 15)) {
      defender = { ...defender, defeated: true, finisher: 'KO', hp: 0 };
      events.push(buildEvent('knockout', turn, `${defenderProfile.name} is knocked out!`, { actorId: attackerProfile.id, targetId: defenderProfile.id }));
    } else if (ko.staggered) {
      defender = { ...defender, staggered: true };
      events.push(buildEvent('stagger', turn, `${defenderProfile.name} is staggered`, { targetId: defenderProfile.id }));
    }
  }

  attacker = { ...attacker, cooldowns: { ...attacker.cooldowns, [card.id]: card.cooldown } };
  return { attacker, defender, events };
}
