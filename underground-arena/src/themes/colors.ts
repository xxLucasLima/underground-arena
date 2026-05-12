/**
 * Underground Arena palette.
 *
 * Inspired by underground fight posters / combat-sport broadcasts:
 *  - very dark, metallic base tones,
 *  - aggressive red primary,
 *  - gold/silver/orange accents for rewards & rarity emphasis,
 *  - subtle neon highlights reserved for feedback (criticals, level ups, drops).
 *
 * Keep semantic names (text, surface, danger) AND visual names (gold, neon).
 * Components consume semantic tokens; feedback layers may reach for visual ones.
 */
export const colors = {
  // Surfaces
  background: '#08080A',
  surface: '#131316',
  surfaceAlt: '#1B1B20',
  surfaceElevated: '#23232A',
  border: '#2A2A33',
  borderStrong: '#3A3A47',

  // Text
  text: '#F5F5F5',
  textMuted: '#9CA3AF',
  textDim: '#5C6270',

  // Accents
  primary: '#B11226',
  primaryMuted: '#7E0D1B',
  primaryGlow: '#FF2D45',
  gold: '#E8B547',
  silver: '#C6CBD3',
  orange: '#FF7A1A',
  neon: '#7CC4FF',

  // Semantic feedback
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  critical: '#FFD166',
} as const;

/**
 * Rarity colors live next to the palette so card visuals, reward popups, and
 * pack reveals all read from the same source. Keep this in sync with
 * `CardRarity` in `@/types/cards`.
 */
export const rarityColors = {
  Common: '#8A8F99',
  Rare: '#4E7BFF',
  Epic: '#B04EFF',
  Legendary: '#FFB547',
} as const;
