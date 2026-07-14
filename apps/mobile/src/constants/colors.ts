/**
 * Design tokens for Tabungan Umroh.
 * High-contrast green + white theme, tuned for elderly users:
 * large touch targets, no low-contrast greys, no gradients.
 */
export const colors = {
  primary: '#16A34A',
  primaryDark: '#15803D',
  primaryLight: '#DCFCE7',
  background: '#F7FAF8',
  surface: '#FFFFFF',
  ink: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
  danger: '#DC2626',
  warning: '#D97706',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
