/**
 * Layered shadows. iOS uses shadow*; Android uses elevation. Both keys are set
 * on every preset so components don't have to remember.
 *
 * Use semantic levels (card / elevated / hero / glow) rather than raw values
 * so we can rebalance the entire visual hierarchy from one file.
 */
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  hero: {
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  // Use for rarity glow on Legendary/Epic cards & reward reveals.
  glow: {
    shadowColor: '#FFB547',
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  glowRed: {
    shadowColor: '#FF2D45',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
} as const;
