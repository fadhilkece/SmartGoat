import React, { useState } from 'react';
import { View, Text, Switch, Alert, Modal, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Gauge from '../components/Gauge';
import { Card, ScreenHeader, SectionTitle, Badge, IconBox, ProgressBar, Button, Stepper, Segmented } from '../components/ui';
import { COLORS, RADIUS, FONT } from '../theme';
import { useIoT, FEEDER_CAPACITY, SAFE_RANGE } from '../context/IoTContext';
import { fmt } from '../utils/format';

const ACTUATORS = [
  { key: 'fan', title: 'Kipas Exhaust', icon: (c) => <MaterialCommunityIcons name="fan" size={20} color={c} />, onText: 'Menyala — sirkulasi udara', offText: 'Mati' },
  { key: 'mist', title: 'Penyemprot Kabut (Mist Cooling)', icon: (c) => <Ionicons name="water" size={20} color={c} />, onText: 'Menyala — pendinginan evaporatif', offText: 'Mati' },
  { key: 'heater', title: 'Pemanas Inframerah', icon: (c) => <Ionicons name="flame" size={20} color={c} />, onText: 'Menyala — menghangatkan kandang', offText: 'Siaga' },
];

export default function KontrolScreen() {
  const iot = useIoT();
  const [adding, setAdding] = useState(false);
  const [time, setTime] = useState('');
  const [label, setLabel] = useState('');

  const dispense = () =>
    Alert.alert('Keluarkan pakan', `Keluarkan ${fmt(iot.feeder.portion)} kg pakan sekarang?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluarkan', onPress: iot.dispense },
    ]);

  const refill = () =>
    Alert.alert('Isi ulang silo', 'Catat bahwa silo sudah diisi penuh (200 kg)?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Ya, penuh', onPress: iot.refill },
    ]);

  const saveSchedule = () => {
    const m = /^([01]?\d|2[0-3])[:.]([0-5]\d)$/.exec(time.trim());
    if (!m) return Alert.alert('Format waktu salah', 'Gunakan format JJ:MM, contoh 12:30.');
    const hhmm = `${m[1].padStart(2, '0')}:${m[2]}`;
    if (iot.schedules.some((s) => s.time === hhmm)) return Alert.alert('Jadwal sudah ada', `Sudah ada jadwal pada ${hhmm}.`);
    iot.addSchedule({
      id: 's' + Date.now(),
      time: hhmm,
      label: label.trim() || 'Sesi Tambahan',
      icon: +m[1] < 12 ? 'sunny' : +m[1] < 18 ? 'partly-sunny' : 'moon',
      formula: `${fmt(iot.feeder.portion)} kg pakan standar`,
      enabled: true,
    });
    setAdding(false);
    setTime('');
    setLabel('');
  };

  const removeSchedule = (s) =>
    Alert.alert('Hapus jadwal', `Hapus jadwal ${s.time} (${s.label})?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => iot.removeSchedule(s.id) },
    ]);

  const low = iot.levelPct < 20;

  return (
    <Screen>
      <ScreenHeader
        title="Pusat Kontrol IoT"
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[st.dot, { backgroundColor: iot.connected ? COLORS.primary : COLORS.danger }]} />
            <Text style={[FONT.small, { fontWeight: '700' }]}>{iot.connected ? 'Terhubung' : 'Terputus'}</Text>
          </View>
        }
      />

      {/* ── PAKAN ── */}
      <Card>
        <View style={st.between}>
          <View style={st.row}>
            <IconBox size={38}><MaterialCommunityIcons name="silo" size={20} color={COLORS.primary} /></IconBox>
            <View style={{ marginLeft: 10 }}>
              <Text style={FONT.h2}>Kontrol Pakan Pintar</Text>
              <Text style={FONT.small}>Feeder-01 · Kandang Blok A</Text>
            </View>
          </View>
          <Badge label={low ? 'Stok Menipis' : 'Aktif'} color={low ? COLORS.danger : COLORS.primary} bg={low ? COLORS.dangerLight : COLORS.primaryLight} />
        </View>

        <View style={st.divider} />

        <View style={st.between}>
          <Text style={FONT.body}>Stok silo</Text>
          <Text style={{ fontWeight: '800', color: low ? COLORS.danger : COLORS.primary }}>
            {fmt(iot.feeder.level, 0)} / {FEEDER_CAPACITY} kg ({fmt(iot.levelPct, 0)}%)
          </Text>
        </View>
        <View style={{ marginVertical: 8 }}>
          <ProgressBar value={iot.levelPct} color={low ? COLORS.danger : COLORS.primary} height={10} />
        </View>
        <View style={st.between}>
          <Text style={FONT.small}>{iot.feeder.lastDispense ? `Terakhir keluar ${iot.feeder.lastDispense}` : 'Belum ada pengeluaran'}</Text>
          <Text style={FONT.small}>{iot.daysLeft ? `Estimasi ±${fmt(iot.daysLeft, 1)} hari` : 'Tanpa jadwal aktif'}</Text>
        </View>

        <View style={[st.between, { marginTop: 18 }]}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={FONT.h2}>Takaran sekali keluar</Text>
            <Text style={FONT.small}>Rentang 0,5 – 5,0 kg</Text>
          </View>
          <Stepper value={iot.feeder.portion} onChange={iot.setPortion} min={0.5} max={5} step={0.5} format={(v) => `${fmt(v)} kg`} />
        </View>

        <Button title="Keluarkan Pakan Sekarang" icon="arrow-down-circle-outline" onPress={dispense} style={{ marginTop: 18 }} disabled={iot.feeder.level < iot.feeder.portion} />
        <Button title="Catat Isi Ulang Silo" icon="refresh" variant="soft" onPress={refill} style={{ marginTop: 10 }} />

        <View style={st.divider} />

        <View style={st.between}>
          <Text style={FONT.label}>Jadwal otomatis</Text>
          <TouchableOpacity onPress={() => setAdding(true)} hitSlop={10}>
            <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 12 }}>+ Tambah</Text>
          </TouchableOpacity>
        </View>
        {iot.schedules.length === 0 && <Text style={[FONT.small, { paddingVertical: 12 }]}>Belum ada jadwal.</Text>}
        {iot.schedules.map((s) => (
          <TouchableOpacity key={s.id} onLongPress={() => removeSchedule(s)} activeOpacity={0.8} style={st.schedule}>
            <IconBox size={40} bg={s.icon === 'sunny' ? COLORS.warningLight : s.icon === 'moon' ? COLORS.blueLight : COLORS.infoLight}>
              <Ionicons name={s.icon} size={20} color={s.icon === 'sunny' ? COLORS.warning : s.icon === 'moon' ? COLORS.blue : COLORS.info} />
            </IconBox>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={FONT.h2}>{s.time} WIB · <Text style={{ fontWeight: '500', color: COLORS.textLight }}>{s.label}</Text></Text>
              <Text style={FONT.small}>{s.formula}</Text>
            </View>
            <Switch value={s.enabled} onValueChange={() => iot.toggleSchedule(s.id)} trackColor={{ true: COLORS.primary, false: COLORS.border }} thumbColor="#fff" />
          </TouchableOpacity>
        ))}
        {iot.schedules.length > 0 && <Text style={[FONT.small, { marginTop: 8 }]}>Tahan lama pada jadwal untuk menghapus.</Text>}
      </Card>

      {/* ── IKLIM ── */}
      <Card>
        <View style={st.between}>
          <View style={st.row}>
            <IconBox size={38}><FontAwesome5 name="temperature-low" size={16} color={COLORS.primary} /></IconBox>
            <View style={{ marginLeft: 10 }}>
              <Text style={FONT.h2}>Suhu & Kelembapan</Text>
              <Text style={FONT.small}>Termostat dengan histeresis</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <Segmented
            value={iot.mode}
            onChange={iot.setMode}
            options={[{ value: 'auto', label: 'Otomatis' }, { value: 'manual', label: 'Manual' }]}
          />
        </View>

        <View style={[st.row, { marginVertical: 20 }]}>
          <Gauge value={iot.temp} min={18} max={38} size={118} stroke={10} color={iot.tempStatus === 'ok' ? COLORS.primary : COLORS.danger}>
            <Text style={FONT.small}>Saat ini</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.text }}>{fmt(iot.temp)}°C</Text>
            <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>RH {Math.round(iot.humidity)}%</Text>
          </Gauge>
          <View style={{ flex: 1, marginLeft: 18 }}>
            <Text style={FONT.h2}>Target suhu</Text>
            <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
              <Stepper value={iot.targetTemp} onChange={iot.setTarget} min={24} max={32} step={0.5} format={(v) => `${fmt(v)}°C`} />
            </View>
            <Text style={[FONT.small, { marginTop: 8 }]}>
              Aman {SAFE_RANGE.min}–{SAFE_RANGE.max}°C. {iot.mode === 'auto' ? 'Aktuator bereaksi otomatis.' : 'Mode manual: aktuator tidak otomatis.'}
            </Text>
          </View>
        </View>

        <Text style={FONT.label}>Status aktuator</Text>
        <View style={{ height: 8 }} />
        {ACTUATORS.map((a) => {
          const on = iot.actuators[a.key];
          return (
            <View key={a.key} style={[st.actuator, on ? st.actOn : st.actOff]}>
              <IconBox size={40} bg={on ? COLORS.primary : COLORS.border}>{a.icon(on ? '#fff' : COLORS.textLight)}</IconBox>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[FONT.h2, !on && { color: COLORS.textLight }]}>{a.title}</Text>
                <Text style={FONT.small}>{on ? a.onText : a.offText}</Text>
              </View>
              <Switch value={on} onValueChange={(v) => iot.setActuator(a.key, v)} trackColor={{ true: COLORS.primaryDark, false: COLORS.border }} thumbColor="#fff" />
            </View>
          );
        })}
      </Card>

      {/* ── MODAL TAMBAH JADWAL ── */}
      <Modal visible={adding} transparent animationType="fade" onRequestClose={() => setAdding(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.backdrop}>
          <View style={st.sheet}>
            <Text style={FONT.title}>Jadwal baru</Text>
            <Text style={[FONT.label, { marginTop: 16 }]}>Waktu (24 jam)</Text>
            <TextInput style={st.input} placeholder="12:30" placeholderTextColor={COLORS.textLight} value={time} onChangeText={setTime} keyboardType="numbers-and-punctuation" maxLength={5} />
            <Text style={[FONT.label, { marginTop: 14 }]}>Nama sesi</Text>
            <TextInput style={st.input} placeholder="Sesi Siang" placeholderTextColor={COLORS.textLight} value={label} onChangeText={setLabel} />
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <Button title="Batal" variant="soft" onPress={() => setAdding(false)} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Simpan" onPress={saveSchedule} style={{ flex: 1 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  schedule: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  actuator: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: RADIUS.md, marginBottom: 10, borderWidth: 1 },
  actOn: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary },
  actOff: { backgroundColor: COLORS.background, borderColor: COLORS.border },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 20 },
  input: { marginTop: 8, height: 48, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, paddingHorizontal: 14, fontSize: 15, color: COLORS.text },
});
