import React, { useState } from 'react';
import { View, Text, Alert, useWindowDimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Screen from '../components/Screen';
import { Card, ScreenHeader, SectionTitle, Button } from '../components/ui';
import { COLORS, FONT } from '../theme';
import { GOATS, herdStats } from '../data/goats';
import { useIoT } from '../context/IoTContext';
import { fmt, dateID } from '../utils/format';

const WEEKLY_FEED = [350, 365, 380, 355]; // kg pakan/minggu (data simulasi)
const WEEKLY_GAIN = [4.1, 4.6, 5.2, 4.4]; // kg kenaikan total/minggu (data simulasi)

function buildReportHtml(iot, stats) {
  const rows = GOATS.map(
    (g) =>
      `<tr><td>${g.tag}</td><td>${g.name}</td><td>${g.pen}</td><td>${fmt(g.weight)}</td><td>${fmt(g.temp)}</td><td>${g.heartRate}</td><td class="${g.status}">${g.status}</td></tr>`
  ).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#0F172A;padding:32px}
    h1{color:#059669;margin:0}h2{margin-top:28px;border-bottom:2px solid #D1FAE5;padding-bottom:6px}
    .meta{color:#64748B;font-size:13px;margin-bottom:20px}
    .kpis{display:flex;gap:12px}.kpi{flex:1;border:1px solid #E2E8F0;border-radius:10px;padding:12px}
    .kpi b{display:block;font-size:22px}.kpi span{font-size:12px;color:#64748B}
    table{width:100%;border-collapse:collapse;font-size:13px;margin-top:10px}
    th{background:#059669;color:#fff;text-align:left;padding:8px}td{padding:8px;border-bottom:1px solid #E2E8F0}
    .Sehat{color:#059669;font-weight:700}.Perawatan{color:#B45309;font-weight:700}.Sakit{color:#EF4444;font-weight:700}
    .foot{margin-top:32px;font-size:11px;color:#94A3B8}
  </style></head><body>
    <h1>Laporan SmartGoat</h1>
    <div class="meta">Dicetak ${dateID()} · Peternakan SmartGoat</div>
    <div class="kpis">
      <div class="kpi"><b>${stats.total}</b><span>Total ternak</span></div>
      <div class="kpi"><b>${stats.sehat}</b><span>Sehat</span></div>
      <div class="kpi"><b>${stats.perawatan + stats.sakit}</b><span>Perawatan / sakit</span></div>
      <div class="kpi"><b>${fmt(stats.avgWeight)} kg</b><span>Rata-rata berat</span></div>
    </div>
    <h2>Kondisi kandang saat laporan</h2>
    <p>Suhu ${fmt(iot.temp)}°C · Kelembapan ${Math.round(iot.humidity)}% · Mode ${iot.mode === 'auto' ? 'otomatis' : 'manual'} · Target ${fmt(iot.targetTemp)}°C<br>
    Stok silo ${fmt(iot.feeder.level, 0)} / 200 kg</p>
    <h2>Data ternak</h2>
    <table><tr><th>Tag</th><th>Nama</th><th>Kandang</th><th>Berat (kg)</th><th>Suhu (°C)</th><th>Detak</th><th>Status</th></tr>${rows}</table>
    <h2>Pakan vs kenaikan berat (4 minggu)</h2>
    <table><tr><th>Minggu</th><th>Pakan (kg)</th><th>Kenaikan berat (kg)</th></tr>
    ${WEEKLY_FEED.map((f, i) => `<tr><td>Minggu ${i + 1}</td><td>${f}</td><td>${fmt(WEEKLY_GAIN[i])}</td></tr>`).join('')}</table>
    <div class="foot">Dibuat otomatis oleh aplikasi SmartGoat.</div>
  </body></html>`;
}

export default function LaporanScreen() {
  const { width } = useWindowDimensions();
  const iot = useIoT();
  const stats = herdStats(GOATS);
  const [busy, setBusy] = useState(false);
  const chartW = width - 76;

  const exportPdf = async () => {
    setBusy(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: buildReportHtml(iot, stats) });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Laporan SmartGoat' });
      else Alert.alert('PDF dibuat', `Tersimpan di: ${uri}`);
    } catch (e) {
      Alert.alert('Gagal membuat PDF', e?.message || 'Terjadi kesalahan.');
    } finally {
      setBusy(false);
    }
  };

  const base = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (o = 1) => `rgba(5,150,105,${o})`,
    labelColor: () => COLORS.textLight,
    propsForBackgroundLines: { stroke: COLORS.border },
  };

  return (
    <Screen>
      <ScreenHeader title="Laporan & Analitik" subtitle={dateID()} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Kpi label="Rata² kenaikan" value={`+${fmt(stats.avgGain)} kg`} />
        <Kpi label="Rata² berat" value={`${fmt(stats.avgWeight)} kg`} />
      </View>

      <SectionTitle>Distribusi kondisi ternak</SectionTitle>
      <Card>
        <PieChart
          data={[
            { name: 'Sehat', population: stats.sehat, color: COLORS.primary, legendFontColor: COLORS.text, legendFontSize: 13 },
            { name: 'Perawatan', population: stats.perawatan, color: COLORS.warning, legendFontColor: COLORS.text, legendFontSize: 13 },
            { name: 'Sakit', population: stats.sakit, color: COLORS.danger, legendFontColor: COLORS.text, legendFontSize: 13 },
          ].filter((d) => d.population > 0)}
          width={chartW}
          height={130}
          chartConfig={base}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          absolute
        />
      </Card>

      <SectionTitle>Pakan mingguan (kg)</SectionTitle>
      <Card>
        <BarChart
          data={{ labels: ['Mg 1', 'Mg 2', 'Mg 3', 'Mg 4'], datasets: [{ data: WEEKLY_FEED }] }}
          width={chartW}
          height={200}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero
          showValuesOnTopOfBars
          chartConfig={base}
          style={{ marginLeft: -12 }}
        />
      </Card>

      <SectionTitle>Kenaikan berat mingguan (kg)</SectionTitle>
      <Card>
        <BarChart
          data={{ labels: ['Mg 1', 'Mg 2', 'Mg 3', 'Mg 4'], datasets: [{ data: WEEKLY_GAIN }] }}
          width={chartW}
          height={200}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero
          showValuesOnTopOfBars
          chartConfig={{ ...base, decimalPlaces: 1, color: (o = 1) => `rgba(79,70,229,${o})` }}
          style={{ marginLeft: -12 }}
        />
      </Card>

      <Button title="Cetak & Bagikan Laporan (PDF)" icon="print-outline" onPress={exportPdf} loading={busy} />
      <Text style={[FONT.small, { textAlign: 'center', marginTop: 10 }]}>Data mingguan masih simulasi; hubungkan ke database untuk data riil.</Text>
    </Screen>
  );
}

function Kpi({ label, value }) {
  return (
    <Card style={{ width: '48.5%' }}>
      <Text style={FONT.small}>{label}</Text>
      <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 4 }}>{value}</Text>
    </Card>
  );
}
