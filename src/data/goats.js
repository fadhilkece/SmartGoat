// Data ternak (simulasi). Ganti dengan data Firebase/REST saat backend siap.
const RAW = [
  { id: '1', tag: 'KM-001', name: 'Etawa Jantan A', breed: 'Etawa', sex: 'Jantan', pen: 'Blok A', age: 26, weight: 45, temp: 38.5, heartRate: 75, weightHistory: [38, 40, 42, 43.5, 45] },
  { id: '2', tag: 'KM-002', name: 'Boer Betina B', breed: 'Boer', sex: 'Betina', pen: 'Blok A', age: 30, weight: 52, temp: 39.8, heartRate: 92, weightHistory: [51, 51.5, 51, 50, 52] },
  { id: '3', tag: 'KM-003', name: 'Kacang Jantan C', breed: 'Kacang', sex: 'Jantan', pen: 'Blok B', age: 14, weight: 25, temp: 38.2, heartRate: 72, weightHistory: [19, 21, 22.5, 24, 25] },
  { id: '4', tag: 'KM-004', name: 'Etawa Betina D', breed: 'Etawa', sex: 'Betina', pen: 'Blok B', age: 22, weight: 41, temp: 38.7, heartRate: 78, weightHistory: [35, 37, 38.5, 40, 41] },
  { id: '5', tag: 'KM-005', name: 'Boer Jantan E', breed: 'Boer', sex: 'Jantan', pen: 'Blok C', age: 18, weight: 48, temp: 39.2, heartRate: 84, weightHistory: [40, 42, 44, 46.5, 48] },
  { id: '6', tag: 'KM-006', name: 'Kacang Betina F', breed: 'Kacang', sex: 'Betina', pen: 'Blok C', age: 12, weight: 22, temp: 38.4, heartRate: 74, weightHistory: [17, 18.5, 20, 21, 22] },
];

// Suhu rektal normal kambing: 38.5–39.5 °C. Di atas 39.5 dianggap demam/sakit.
export function resolveStatus(temp) {
  if (temp > 39.5) return 'Sakit';
  if (temp >= 39.0) return 'Perawatan';
  return 'Sehat';
}

export const GOATS = RAW.map((g) => ({ ...g, status: resolveStatus(g.temp) }));

export function findGoatByTag(tag) {
  const clean = String(tag || '').trim().toUpperCase();
  return GOATS.find((g) => g.tag.toUpperCase() === clean);
}

export function herdStats(list = GOATS) {
  const total = list.length;
  const count = (s) => list.filter((g) => g.status === s).length;
  const avgWeight = total ? list.reduce((a, g) => a + g.weight, 0) / total : 0;
  const avgGain = total
    ? list.reduce((a, g) => a + (g.weightHistory[g.weightHistory.length - 1] - g.weightHistory[0]), 0) / total
    : 0;
  return { total, sehat: count('Sehat'), perawatan: count('Perawatan'), sakit: count('Sakit'), avgWeight, avgGain };
}
