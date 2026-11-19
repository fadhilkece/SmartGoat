import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import Screen from '../components/Screen';
import Gauge from '../components/Gauge';
import { Card, SectionTitle, ScreenHeader, Badge, IconBox, ProgressBar } from '../components/ui';
import { COLORS, FONT } from '../theme';
import { useIoT, SAFE_RANGE } from '../context/IoTContext';
import { useAuth } from '../context/AuthContext';
import { GOATS, herdStats } from '../data/goats';
import { fmt, dateID } from '../utils/format';

const ALERT_STYLE = {
  danger: { icon: 'alert-circle', color: COLORS.danger, bg: COLORS.dangerLight },
  warning: { icon: 'warning', color: COLORS.warning, bg: COLORS.warningLight },
  info: { icon: 'information-circle', color: COLORS.info, bg: COLORS.infoLight },
};

export default function BerandaScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const iot = useIoT();
  const { user, signOut } = useAuth();
  const stats = herdStats(GOATS);

  const tempColor = iot.tempStatus === 'ok' ? COLORS.primary : iot.tempStatus === 'high' ? COLORS.danger : COLORS.info;
  const humColor = iot.humidityStatus === 'ok' ? COLORS.primary : COLORS.warning;

  const profile = () =>
    Alert.alert(user?.username || 'Pengguna', user?.farm, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: signOut },
    ]);

  return (
    <Screen>
      <ScreenHeader
        title={`Halo, ${user?.username || 'Peternak'}`}
        subtitle={dateID()}
        right={
          <TouchableOpacity onPress={profile} style={st.avatar} accessibilityLabel="Profil">
            <Text style={st.avatarText}>{(user?.username || 'U')[0].toUpperCase()}</Text>
          </TouchableOpacity>
        }
      />

      <View style={st.hero}>
        <View style={st.liveDot(iot.connected)} />
        <Text style={st.heroText}>{iot.connected ? 'Perangkat IoT terhubung' : 'Perangkat terputus'} · mode {iot.mode === 'auto' ? 'otomatis' : 'manual'}</Text>
      </View>

      <SectionTitle>Telemetri kandang (langsung)</SectionTitle>
      <View style={st.row}>
        <Card style={st.half}>
          <Gauge value={iot.temp} min={18} max={38} color={tempColor}>
            <FontAwesome5 name="temperature-high" size={16} color={tempColor} />
            <Text style={st.gaugeVal}>{fmt(iot.temp)}°C</Text>
          </Gauge>
          <Text style={st.metricLabel}>Suhu Kandang</Text>
          <Text style={[FONT.small, { textAlign: 'center' }]}>Aman {SAFE_RANGE.min}–{SAFE_RANGE.max}°C</Text>
        </Card>
        <Card style={st.half}>
          <Gauge value={iot.humidity} min={0} max={100} color={humColor}>
            <Ionicons name="water-outline" size={20} color={humColor} />
            <Text style={st.gaugeVal}>{Math.round(iot.humidity)}%</Text>
          </Gauge>
          <Text style={st.metricLabel}>Kelembapan</Text>
          <Text style={[FONT.small, { textAlign: 'center' }]}>Optimal 60–70%</Text>
        </Card>
      </View>

      <Card>
        <Text style={FONT.h2}>Tren suhu</Text>
        <Text style={[FONT.small, { marginBottom: 8 }]}>20 pembacaan terakhir</Text>
        <LineChart
          data={{ labels: iot.tempHistory.map(() => ''), datasets: [{ data: iot.tempHistory.map((v) => +v.toFixed(1)) }] }}
          width={width - 40 - 36}
          height={140}
          withDots={false}
          withInnerLines={false}
          withVerticalLabels={false}
          bezier
          yAxisSuffix="°"
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: () => COLORS.primary,
            labelColor: () => COLORS.textLight,
            propsForBackgroundLines: { stroke: COLORS.border },
          }}
          style={{ marginLeft: -16 }}
        />
      </Card>

      <SectionTitle right="Detail" onRightPress={() => navigation.navigate('Ternak')}>Kesehatan & populasi</SectionTitle>
      <Card>
        <View style={st.rowBetween}>
          <Stat label="Total" value={stats.total} unit="ekor" />
          <Stat label="Sehat" value={stats.sehat} unit="ekor" color={COLORS.primary} />
          <Stat label="Perawatan" value={stats.perawatan + stats.sakit} unit="ekor" color={COLORS.warning} />
          <Stat label="Rata² berat" value={fmt(stats.avgWeight)} unit="kg" />
        </View>
      </Card>

      <SectionTitle right="Kontrol" onRightPress={() => navigation.navigate('Kontrol')}>Ringkasan pakan</SectionTitle>
      <Card>
        <View style={st.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconBox><MaterialCommunityIcons name="silo" size={20} color={COLORS.primary} /></IconBox>
            <View style={{ marginLeft: 12 }}>
              <Text style={FONT.h2}>Silo {fmt(iot.feeder.level, 0)} / 200 kg</Text>
              <Text style={FONT.small}>{iot.daysLeft ? `Estimasi ±${fmt(iot.daysLeft, 1)} hari` : 'Tidak ada jadwal aktif'}</Text>
            </View>
          </View>
          <Badge label={iot.levelPct < 20 ? 'Menipis' : 'Aman'} color={iot.levelPct < 20 ? COLORS.danger : COLORS.primary} bg={iot.levelPct < 20 ? COLORS.dangerLight : COLORS.primaryLight} />
        </View>
        <View style={{ marginTop: 12 }}>
          <ProgressBar value={iot.levelPct} color={iot.levelPct < 20 ? COLORS.danger : COLORS.primary} />
        </View>
      </Card>

      <SectionTitle right={iot.alerts.length ? 'Hapus' : undefined} onRightPress={iot.clearAlerts}>Notifikasi</SectionTitle>
      <Card style={{ padding: 8 }}>
        {iot.alerts.length === 0 ? (
          <Text style={[FONT.small, { padding: 12, textAlign: 'center' }]}>Tidak ada peringatan. Semua sistem normal.</Text>
        ) : (
          iot.alerts.slice(0, 5).map((a) => {
            const t = ALERT_STYLE[a.type] || ALERT_STYLE.info;
            return (
              <View key={a.id} style={st.alertRow}>
                <IconBox size={34} bg={t.bg}><Ionicons name={t.icon} size={18} color={t.color} /></IconBox>
                <Text style={[FONT.body, { flex: 1, marginLeft: 10, fontSize: 13 }]}>{a.message}</Text>
                <Text style={FONT.small}>{a.time}</Text>
              </View>
            );
          })
        )}
      </Card>
    </Screen>
  );
}

function Stat({ label, value, unit, color = COLORS.text }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={FONT.small}>{label}</Text>
      <Text style={{ fontSize: 20, fontWeight: '800', color, marginTop: 2 }}>{value}</Text>
      <Text style={{ fontSize: 10, color: COLORS.textLight }}>{unit}</Text>
    </View>
  );
}

const st = {
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  half: { width: '48.5%', alignItems: 'center', paddingVertical: 16 },
  gaugeVal: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  metricLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginTop: 12, marginBottom: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primarySoft, padding: 12, borderRadius: 12, marginBottom: 18, borderWidth: 1, borderColor: COLORS.primaryLight },
  heroText: { fontSize: 12, fontWeight: '600', color: COLORS.primaryDark },
  liveDot: (on) => ({ width: 8, height: 8, borderRadius: 4, marginRight: 8, backgroundColor: on ? COLORS.primary : COLORS.danger }),
  alertRow: { flexDirection: 'row', alignItems: 'center', padding: 8 },
};
