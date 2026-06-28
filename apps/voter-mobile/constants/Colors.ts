/**
 * Votosi Design System Colors
 * Derived from admin/app/globals.css dark-mode variables.
 * Primary: warm amber  — consistent with the admin dashboard brand.
 */
export const Colors = {
  // ── Backgrounds (--background / --card dark) ──────────────────────────────
  background:          '#32322D',   // oklch(0.2679 0.0036 106.64)
  backgroundSecondary: '#2E2E29',   // oklch(0.2213 0.0038 106.71) --muted dark
  backgroundTertiary:  '#2A2A25',   // oklch(0.2130 0.0078 95.42)  --accent dark
  surface:             '#3A3A34',   // slightly lifted from background
  surfaceElevated:     '#424239',   // --popover dark oklch(0.3085)

  // ── Brand accent — warm amber (--primary dark) ────────────────────────────
  primary:      '#C98B45',              // oklch(0.6724 0.1308 38.76)
  primaryLight: '#D9A25E',              // lightened for highlights
  primaryDark:  '#A96E30',              // darkened for pressed states
  primaryMuted: 'rgba(201,139,69,0.15)',
  primaryGlow:  'rgba(201,139,69,0.30)',

  // ── Text (--foreground / --muted-foreground dark) ─────────────────────────
  textPrimary:   '#CFC9B8',   // oklch(0.8074 0.0142 93.01)  --foreground dark
  textSecondary: '#C3BC9F',   // oklch(0.7713 0.0169 99.07)  --muted-foreground dark
  textMuted:     '#8A8475',   // midpoint, subdued
  textInverse:   '#FFFFFF',   // on-primary text

  // ── Status ────────────────────────────────────────────────────────────────
  success:     '#6EBF8B',              // soft green kept from original
  warning:     '#D4922A',              // amber-adjacent warning
  error:       '#E05A3A',              // oklch(0.6368 0.2078 25.33) --destructive dark
  errorMuted:  'rgba(224,90,58,0.15)',
  info:        '#7BAFD4',              // muted blue

  // ── Borders (--border dark oklch(0.3618 0.0101 106.89)) ──────────────────
  border:       '#52524A',
  borderLight:  '#5E5E55',
  borderFocus:  '#C98B45',   // same as primary

  // ── Glassmorphism ─────────────────────────────────────────────────────────
  glassBg:    'rgba(58,58,52,0.80)',
  glassStroke:'rgba(207,201,184,0.10)',

  // ── Biometric accent ──────────────────────────────────────────────────────
  biometric:      '#7BAFD4',
  biometricMuted: 'rgba(123,175,212,0.15)',

  // ── Overlay ───────────────────────────────────────────────────────────────
  overlay:      'rgba(0,0,0,0.60)',
  overlayLight: 'rgba(0,0,0,0.30)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 36,
} as const;

