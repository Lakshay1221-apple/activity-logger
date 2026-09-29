/**
 * Theme Color Palettes - Minimal, Personal, Calm Design
 */

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceCard: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  accent: string;
  accentSubtle: string;
  accentText: string;
  success: string;
  successSubtle: string;
  warning: string;
  warningSubtle: string;
  danger: string;
  dangerSubtle: string;
  dangerText: string;
  divider: string;
  cardHighlight: string;
  overlay: string;
}

export const lightColors: ThemeColors = {
  background: '#FAF9F6',
  surface: '#FFFFFF',
  surfaceElevated: '#F3F2EE',
  surfaceCard: '#FFFFFF',
  border: '#E8E5DF',
  borderSubtle: '#F0ECE4',
  textPrimary: '#181A1D',
  textSecondary: '#5A626C',
  textMuted: '#8D97A3',
  textInverse: '#FFFFFF',
  accent: '#0E7469',
  accentSubtle: '#E8F5F3',
  accentText: '#0A534B',
  success: '#16A34A',
  successSubtle: '#DCFCE7',
  warning: '#D97706',
  warningSubtle: '#FEF3C7',
  danger: '#DC2626',
  dangerSubtle: '#FEE2E2',
  dangerText: '#B91C1C',
  divider: '#EDEAE4',
  cardHighlight: '#E0E7FF',
  overlay: 'rgba(0, 0, 0, 0.45)',
};

export const darkColors: ThemeColors = {
  background: '#111315',
  surface: '#181B1F',
  surfaceElevated: '#21262D',
  surfaceCard: '#1A1E23',
  border: '#2A3039',
  borderSubtle: '#22272E',
  textPrimary: '#F1F3F5',
  textSecondary: '#9CA6B5',
  textMuted: '#687282',
  textInverse: '#111315',
  accent: '#2DD4BF',
  accentSubtle: '#113532',
  accentText: '#5EEAD4',
  success: '#4ADE80',
  successSubtle: '#143823',
  warning: '#FBBF24',
  warningSubtle: '#3B2F11',
  danger: '#F87171',
  dangerSubtle: '#3B181A',
  dangerText: '#FCA5A5',
  divider: '#252B33',
  cardHighlight: '#1E293B',
  overlay: 'rgba(0, 0, 0, 0.7)',
};
