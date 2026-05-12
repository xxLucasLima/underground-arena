import type { CardCategory, CardRarity, StatusEffectType } from '@/types/cards';

/**
 * FeedbackCue is the UI-only language of game feel.
 *
 * It is intentionally decoupled from the combat engine:
 *  - the engine emits gameplay `CombatEvent`s,
 *  - the adapter (`combatToFeedback`) translates those into FeedbackCues,
 *  - feedback consumers (HitLayer, audio, haptics) react to cues only.
 *
 * That means we can add new visual reactions or swap the renderer entirely
 * without touching engine code or rewriting screens.
 */
export type FeedbackImpact = 'light' | 'medium' | 'heavy' | 'critical';

export type FeedbackTarget = 'player' | 'opponent';

export type FeedbackCue =
  | { kind: 'hit'; target: FeedbackTarget; impact: FeedbackImpact; damage: number; critical?: boolean }
  | { kind: 'critical'; target: FeedbackTarget; damage: number }
  | {
      /**
       * "A move was used." Carries enough card metadata for the presentation
       * layer to render a rarity-styled banner without touching the card db.
       *
       * Decoupling intent: the adapter resolves cardId → card metadata from
       * the active fighter's deck, so UI never reaches back into the engine
       * or data layer for this cosmetic info.
       */
      kind: 'move';
      target: FeedbackTarget;
      cardId: string;
      name: string;
      icon: string;
      rarity: CardRarity;
      category: CardCategory;
      isUltimate: boolean;
    }
  | { kind: 'combo'; target: FeedbackTarget; count: number }
  | { kind: 'counter'; target: FeedbackTarget }
  | { kind: 'stagger'; target: FeedbackTarget }
  | { kind: 'dodge'; target: FeedbackTarget }
  | {
      /**
       * "Attack didn't land cleanly." Single cue covering all defensive
       * outcomes so the presentation layer can render one consistent badge.
       *
       *  - dodge:    target evaded by speed / accuracy roll failure
       *  - block:    target absorbed with Defense category
       *  - parry:    target deflected with technique
       *  - miss:     attacker's accuracy roll missed cleanly
       *  - counter:  target countered for damage in return
       *
       * `target` is the *defender* (the one performing the defense), which
       * differs from `hit` where target is the one taking damage.
       */
      kind: 'defense';
      target: FeedbackTarget;
      outcome: 'dodge' | 'block' | 'parry' | 'miss' | 'counter';
    }
  | { kind: 'status'; target: FeedbackTarget; status: NonNullable<StatusEffectType>; applied: boolean }
  | { kind: 'stamina'; target: FeedbackTarget; delta: number }
  | { kind: 'ko'; target: FeedbackTarget }
  | { kind: 'submission'; target: FeedbackTarget }
  | { kind: 'matchStart' }
  | { kind: 'matchEnd'; winner: FeedbackTarget | 'draw' }
  | { kind: 'reward'; label: string; tier: 'xp' | 'coins' | 'card' | 'level' | 'achievement' };

export type FeedbackListener = (cue: FeedbackCue) => void;
