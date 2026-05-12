/**
 * Typography scale. Sizes are in pt. Components should read these tokens
 * instead of hardcoding font sizes.
 */
export const typography = {
  display: 34,
  title: 26,
  subtitle: 20,
  body: 15,
  caption: 12,
  micro: 10,
  weight: {
    regular: '400' as const,
    medium: '600' as const,
    bold: '700' as const,
    black: '800' as const,
  },
} as const;
