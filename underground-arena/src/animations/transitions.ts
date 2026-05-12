import { motion } from '@/themes/motion';

/**
 * Back-compat aliases. New code should import `motion` from `@/themes` instead.
 * Kept here so existing imports of `animationDurations` keep compiling.
 */
export const animationDurations = {
  fast: motion.duration.fast,
  normal: motion.duration.normal,
  slow: motion.duration.slow,
} as const;
