import type { FeedbackCue, FeedbackListener } from './types';

/**
 * Tiny pub/sub bus for game-feel cues.
 *
 * Why a dedicated bus (and not `eventBus`):
 *  - eventBus carries *domain* events (fight won, card unlocked, level up) for
 *    progression/services. Adding visual cues there would couple gameplay code
 *    with UI semantics.
 *  - feedbackBus is UI-only and high-frequency (per-hit). Keeping it separate
 *    lets us add throttling / batching here without touching domain code.
 *
 * The bus is intentionally synchronous: listeners are cheap UI triggers
 * (Animated values + haptics) and we want them to fire in the same frame
 * the cue was emitted.
 */
class FeedbackBus {
  private listeners = new Set<FeedbackListener>();

  on(listener: FeedbackListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(cue: FeedbackCue): void {
    // Snapshot so listeners that unsubscribe during emit don't trip iteration.
    for (const l of Array.from(this.listeners)) {
      try {
        l(cue);
      } catch {
        // Listeners must never crash the loop. Swallow + continue.
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const feedbackBus = new FeedbackBus();
