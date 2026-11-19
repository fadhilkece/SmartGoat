import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW, FONT, STATUS } from '../theme';

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ children, right, onRightPress }) {
  return (
    <View style={s.sectionRow}>
      <Text style={FONT.label}>{children}</Text>
      {right ? (
        <TouchableOpacity onPress={onRightPress} hitSlop={10}>
          <Text style={s.link}>{right}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function ScreenHeader({ title, subtitle, right }) {
  return (
    <View style={s.header}>
      <View style={{ flex: 1 }}>
        <Text style={FONT.title}>{title}</Text>
        {subtitle ? <Text style={[FONT.small, { marginTop: 2 }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Badge({ label, status, color, bg, style }) {
  const palette = status ? STATUS[status] : { fg: color || COLORS.primary, bg: bg || COLORS.primaryLight };
  return (
    <View style={[s.badge, { backgroundColor: palette.bg }, style]}>
      <Text style={[s.badgeText, { color: palette.fg }]}>{label || status}</Text>
    </View>
  );
}

export function Button({ title, icon, onPress, variant = 'primary', loading, disabled, style }) {
  const isPrimary = variant === 'primary';
  const bg = isPrimary ? COLORS.primary : variant === 'danger' ? COLORS.dangerLight : COLORS.primarySoft;
  const fg = isPrimary ? '#fff' : variant === 'danger' ? COLORS.danger : COLORS.primary;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[s.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 8 }} /> : null}
          <Text style={[s.btnText, { color: fg }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function IconBox({ children, bg = COLORS.primaryLight, size = 40, style }) {
  return (
    <View style={[{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }, style]}>
      {children}
    </View>
  );
}

export function ProgressBar({ value, color = COLORS.primary, height = 8 }) {
  return (
    <View style={{ height, backgroundColor: COLORS.border, borderRadius: height / 2, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}

export function Stepper({ value, onChange, step = 0.5, min, max, format }) {
  const dec = () => onChange(Math.max(min, +(value - step).toFixed(2)));
  const inc = () => onChange(Math.min(max, +(value + step).toFixed(2)));
  return (
    <View style={s.stepper}>
      <TouchableOpacity onPress={dec} style={s.stepBtn} disabled={value <= min} accessibilityLabel="Kurangi">
        <Ionicons name="remove" size={20} color={value <= min ? COLORS.border : COLORS.primary} />
      </TouchableOpacity>
      <Text style={s.stepValue}>{format ? format(value) : value}</Text>
      <TouchableOpacity onPress={inc} style={s.stepBtn} disabled={value >= max} accessibilityLabel="Tambah">
        <Ionicons name="add" size={20} color={value >= max ? COLORS.border : COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <View style={s.segment}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity key={o.value} onPress={() => onChange(o.value)} style={[s.segItem, active && s.segActive]}>
            <Text style={[s.segText, active && { color: '#fff' }]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function EmptyState({ icon = 'file-tray-outline', text }) {
  return (
    <View style={{ alignItems: 'center', padding: 32 }}>
      <Ionicons name={icon} size={36} color={COLORS.border} />
      <Text style={[FONT.small, { marginTop: 8, textAlign: 'center' }]}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 },
  link: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  btn: { height: 48, borderRadius: RADIUS.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  btnText: { fontSize: 14, fontWeight: '700' },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.md, padding: 4 },
  stepBtn: { width: 36, height: 36, borderRadius: RADIUS.sm, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 72, textAlign: 'center', fontSize: 16, fontWeight: '800', color: COLORS.text },
  segment: { flexDirection: 'row', backgroundColor: COLORS.border, borderRadius: RADIUS.md, padding: 3 },
  segItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: RADIUS.sm + 1 },
  segActive: { backgroundColor: COLORS.primary },
  segText: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
});
