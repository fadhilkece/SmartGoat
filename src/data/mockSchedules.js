export const INITIAL_FEED_SCHEDULES = [
  {
    id: 'sch-1',
    time: '07:00 WIB',
    session: 'Sesi Pagi',
    formula: '2,5 kg Pelet Fermentasi + Rumput Odot',
    enabled: true,
  },
  {
    id: 'sch-2',
    time: '16:00 WIB',
    session: 'Sesi Sore',
    formula: '2,5 kg Konsentrat Protein Tinggi & Mineral',
    enabled: true,
  },
];

export const WEEKLY_FEED_STATS = {
  labels: ['Mg 1', 'Mg 2', 'Mg 3', 'Mg 4'],
  feedKg: [350, 365, 380, 355],
  avgWeightKg: [32.1, 33.0, 33.8, 34.5],
};