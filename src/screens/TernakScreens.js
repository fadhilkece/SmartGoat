import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, StyleSheet, StatusBar, useWindowDimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LineChart } from 'react-native-chart-kit';
import Screen from '../components/Screen';
import { Card, ScreenHeader, Badge, IconBox, EmptyState, SectionTitle } from '../components/ui';
import { COLORS, RADIUS, FONT, STATUS } from '../theme';
import { GOATS, findGoatByTag } from '../data/goats';
import { fmt } from '../utils/format';

const FILTERS = ['Semua', 'Sehat', 'Perawatan', 'Sakit'];

export function TernakScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [scanning, setScanning] = useState(false);
  const [locked, setLocked] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GOATS.filter(
      (g) =>
        (filter === 'Semua' || g.status === filter) &&
        (!q || g.tag.toLowerCase().includes(q) || g.name.toLowerCase().includes(q) || g.breed.toLowerCase().includes(q))
    );
  }, [search, filter]);

  const openScanner = async () => {
    let granted = permission?.granted;
    if (!granted) {
      const res = await requestPermission();
      granted = res.granted;
    }
    if (!granted) {
      Alert.alert('Izin kamera diperlukan', 'Aktifkan izin kamera di pengaturan untuk memindai tag ternak.');
      return;
    }
    setLocked(false);
    setScanning(true);
  };

  const onScanned = ({ data }) => {
    if (locked) return; // cegah event ganda
    setLocked(true);
    setScanning(false);
    const goat = findGoatByTag(data);
    if (goat) navigation.navigate('GoatDetail', { id: goat.id });
    else {
      setSearch(String(data));
      Alert.alert('Tag tidak terdaftar', `Kode "${data}" tidak ditemukan di data ternak.`);
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Monitoring Ternak" subtitle={`${GOATS.length} ekor terdaftar`} />

      <View style={st.searchRow}>
        <View style={st.search}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput style={st.searchInput} placeholder="Cari tag, nama, atau ras…" placeholderTextColor={COLORS.textLight} value={search} onChangeText={setSearch} />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={st.scanBtn} onPress={openScanner} accessibilityLabel="Pindai tag">
          <Ionicons name="qr-code" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={st.chips}>
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[st.chip, active && st.chipActive]}>
              <Text style={[st.chipText, active && { color: '#fff' }]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {list.length === 0 ? (
        <EmptyState text="Tidak ada ternak yang cocok dengan pencarian." />
      ) : (
        list.map((g) => (
          <TouchableOpacity key={g.id} activeOpacity={0.8} onPress={() => navigation.navigate('GoatDetail', { id: g.id })}>
            <Card style={{ marginBottom: 12 }}>
              <View style={st.rowBetween}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <IconBox size={46} bg={STATUS[g.status].bg}>
                    <MaterialCommunityIcons name="sheep" size={26} color={STATUS[g.status].fg} />
                  </IconBox>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={FONT.h2}>{g.tag}</Text>
                    <Text style={FONT.small}>{g.name} · {g.pen}</Text>
                  </View>
                </View>
                <Badge status={g.status} />
              </View>
              <View style={st.metrics}>
                <Metric icon="scale-outline" label="Berat" value={`${fmt(g.weight)} kg`} />
                <Metric icon="thermometer-outline" label="Suhu" value={`${fmt(g.temp)}°C`} warn={g.temp >= 39} />
                <Metric icon="heart-outline" label="Detak" value={`${g.heartRate} bpm`} />
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}

      <Modal visible={scanning} animationType="slide" onRequestClose={() => setScanning(false)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <StatusBar barStyle="light-content" />
          {permission?.granted && (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'code39', 'ean13'] }}
              onBarcodeScanned={onScanned}
            />
          )}
          <View style={st.scanOverlay} pointerEvents="none">
            <View style={st.scanFrame} />
            <Text style={st.scanHint}>Arahkan kamera ke QR / barcode tag telinga</Text>
          </View>
          <TouchableOpacity onPress={() => setScanning(false)} style={st.closeScan} accessibilityLabel="Tutup pemindai">
            <Ionicons name="close-circle" size={42} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </Screen>
  );
}

function Metric({ icon, label, value, warn }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Ionicons name={icon} size={16} color={warn ? COLORS.danger : COLORS.textLight} />
      <Text style={{ fontSize: 14, fontWeight: '700', color: warn ? COLORS.danger : COLORS.text, marginTop: 2 }}>{value}</Text>
      <Text style={{ fontSize: 10, color: COLORS.textLight }}>{label}</Text>
    </View>
  );
}

export function GoatDetailScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const goat = GOATS.find((g) => g.id === route.params.id);
  if (!goat) return <Screen><EmptyState text="Data ternak tidak ditemukan." /></Screen>;
  const gain = goat.weightHistory[goat.weightHistory.length - 1] - goat.weightHistory[0];

  return (
    <Screen>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
        <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Kembali</Text>
      </TouchableOpacity>

      <Card>
        <View style={st.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconBox size={56} bg={STATUS[goat.status].bg}>
              <MaterialCommunityIcons name="sheep" size={32} color={STATUS[goat.status].fg} />
            </IconBox>
            <View style={{ marginLeft: 14 }}>
              <Text style={FONT.title}>{goat.tag}</Text>
              <Text style={FONT.small}>{goat.name}</Text>
            </View>
          </View>
          <Badge status={goat.status} />
        </View>
        <View style={st.facts}>
          <Fact label="Ras" value={goat.breed} />
          <Fact label="Kelamin" value={goat.sex} />
          <Fact label="Umur" value={`${goat.age} bln`} />
          <Fact label="Kandang" value={goat.pen} />
        </View>
      </Card>

      <SectionTitle>Vital terkini</SectionTitle>
      <View style={st.rowBetween}>
        <Vital icon="thermometer-outline" label="Suhu tubuh" value={`${fmt(goat.temp)}°C`} note="Normal 38,5–39,5" bad={goat.temp > 39.5} />
        <Vital icon="heart-outline" label="Detak jantung" value={`${goat.heartRate}`} note="Normal 70–90 bpm" bad={goat.heartRate > 90} />
      </View>

      <Card>
        <View style={st.rowBetween}>
          <Text style={FONT.h2}>Perkembangan berat</Text>
          <Badge label={`${gain >= 0 ? '+' : ''}${fmt(gain)} kg`} color={gain >= 0 ? COLORS.primary : COLORS.danger} bg={gain >= 0 ? COLORS.primaryLight : COLORS.dangerLight} />
        </View>
        <LineChart
          data={{ labels: ['M1', 'M2', 'M3', 'M4', 'M5'], datasets: [{ data: goat.weightHistory }] }}
          width={width - 76}
          height={170}
          yAxisSuffix=" kg"
          bezier
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: () => COLORS.primary,
            labelColor: () => COLORS.textLight,
            propsForBackgroundLines: { stroke: COLORS.border },
          }}
          style={{ marginTop: 12, marginLeft: -12 }}
        />
      </Card>

      {goat.status !== 'Sehat' && (
        <Card style={{ backgroundColor: STATUS[goat.status].bg, borderColor: STATUS[goat.status].fg }}>
          <Text style={[FONT.h2, { color: STATUS[goat.status].fg }]}>Perlu perhatian</Text>
          <Text style={[FONT.body, { marginTop: 6 }]}>
            Suhu tubuh {fmt(goat.temp)}°C di atas rentang normal. Pisahkan dari kelompok, cek nafsu makan, dan hubungi dokter hewan bila berlanjut lebih dari 24 jam.
          </Text>
        </Card>
      )}
    </Screen>
  );
}

function Fact({ label, value }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 10, color: COLORS.textLight, textTransform: 'uppercase', fontWeight: '700' }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 2 }}>{value}</Text>
    </View>
  );
}

function Vital({ icon, label, value, note, bad }) {
  return (
    <Card style={{ width: '48.5%' }}>
      <Ionicons name={icon} size={20} color={bad ? COLORS.danger : COLORS.primary} />
      <Text style={{ fontSize: 24, fontWeight: '800', color: bad ? COLORS.danger : COLORS.text, marginTop: 6 }}>{value}</Text>
      <Text style={FONT.h2}>{label}</Text>
      <Text style={FONT.small}>{note}</Text>
    </Card>
  );
}

const st = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  searchRow: { flexDirection: 'row', marginBottom: 12 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: COLORS.border, marginRight: 10 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: COLORS.text },
  scanBtn: { width: 50, height: 50, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.pill, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  metrics: { flexDirection: 'row', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  facts: { flexDirection: 'row', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  scanOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: 240, height: 240, borderRadius: 24, borderWidth: 3, borderColor: '#fff' },
  scanHint: { color: '#fff', marginTop: 20, fontWeight: '600' },
  closeScan: { position: 'absolute', top: 54, right: 20 },
});
