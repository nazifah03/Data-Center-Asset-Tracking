/**
 * useTheme — Custom hook untuk akses theme colors
 * Menggabungkan base colors dari template + brand colors kami
 */

import { getColors } from '@/theme/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return getColors(theme);
}
