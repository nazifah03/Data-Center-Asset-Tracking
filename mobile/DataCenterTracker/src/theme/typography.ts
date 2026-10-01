import { Platform } from 'react-native';

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const FontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const LineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const Typography = {
  // Headings
  h1: { fontSize: FontSizes['3xl'], fontWeight: FontWeights.bold, lineHeight: FontSizes['3xl'] * 1.2 },
  h2: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.bold, lineHeight: FontSizes['2xl'] * 1.2 },
  h3: { fontSize: FontSizes.xl, fontWeight: FontWeights.semibold, lineHeight: FontSizes.xl * 1.3 },
  h4: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, lineHeight: FontSizes.lg * 1.3 },

  // Body
  body: { fontSize: FontSizes.md, fontWeight: FontWeights.regular, lineHeight: FontSizes.md * 1.5 },
  bodySmall: { fontSize: FontSizes.base, fontWeight: FontWeights.regular, lineHeight: FontSizes.base * 1.5 },

  // Label & Caption
  label: { fontSize: FontSizes.base, fontWeight: FontWeights.medium, lineHeight: FontSizes.base * 1.4 },
  caption: { fontSize: FontSizes.sm, fontWeight: FontWeights.regular, lineHeight: FontSizes.sm * 1.4 },
  overline: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, lineHeight: FontSizes.xs * 1.4, letterSpacing: 0.5 },

  // Button
  button: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, lineHeight: FontSizes.md * 1.2 },
  buttonSmall: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, lineHeight: FontSizes.base * 1.2 },
} as const;
