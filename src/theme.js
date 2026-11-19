// Design tokens SmartGoat — satu sumber kebenaran untuk warna, jarak, dan tipografi.
export const COLORS = {
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: '#D1FAE5',
  primarySoft: '#ECFDF5',
  background: '#F4F7FA',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textLight: '#64748B',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  blue: '#4F46E5',
  blueLight: '#E0E7FF',
  info: '#0EA5E9',
  infoLight: '#E0F2FE',
};

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
export const RADIUS = { sm: 8, md: 12, lg: 16, pill: 999 };

export const SHADOW = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

export const FONT = {
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  h2: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.text },
  small: { fontSize: 12, color: COLORS.textLight },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
};

export const STATUS = {
  Sehat: { fg: COLORS.primary, bg: COLORS.primaryLight },
  Perawatan: { fg: '#B45309', bg: COLORS.warningLight },
  Sakit: { fg: COLORS.danger, bg: COLORS.dangerLight },
};
