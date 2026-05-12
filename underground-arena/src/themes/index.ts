import { colors, rarityColors } from './colors';
import { motion } from './motion';
import { radii } from './radii';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  rarityColors,
  spacing,
  typography,
  shadows,
  radii,
  motion,
} as const;

export { colors, rarityColors, spacing, typography, shadows, radii, motion };
