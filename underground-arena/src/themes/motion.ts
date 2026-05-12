import { Easing } from 'react-native';

/**
 * Motion tokens — the single source of truth for *timing*, *easings*, and
 * *magnitudes* used by every animation in the app.
 *
 * Game-feel philosophy:
 *  - Snappy default (180ms) — UI reacts inside one human-attention window.
 *  - "Impact" easings are linear-out for hit pause / shake / flash bursts.
 *  - "Reveal" easings use exponential-out for satisfying rest-state arrivals.
 *  - Anything heavier than `slow` is a one-shot dramatic moment (KO, legendary
 *    pack reveal) and should be rare on purpose.
 *
 * Components must not import `Easing` directly — go through `motion.easing.*`.
 * That lets us swap to a reduced-motion bundle in one place.
 */
export const motion = {
  duration: {
    micro: 90,
    fast: 160,
    normal: 240,
    slow: 360,
    hero: 520,
    ko: 900,
  },
  /** Magnitudes for screen shake & punch scale. Tuned for mobile. */
  shake: {
    light: 2,
    medium: 5,
    heavy: 10,
    ko: 16,
  },
  punchScale: {
    light: 1.04,
    medium: 1.08,
    heavy: 1.14,
  },
  easing: {
    standard: Easing.bezier(0.2, 0, 0, 1),
    out: Easing.out(Easing.cubic),
    in: Easing.in(Easing.cubic),
    inOut: Easing.inOut(Easing.cubic),
    bounce: Easing.bezier(0.34, 1.56, 0.64, 1), // overshoot for reveals
    impact: Easing.out(Easing.exp), // hit-stop release
  },
} as const;

export type MotionDurationKey = keyof typeof motion.duration;
