export const fmt = (n, d = 1) =>
  Number(n).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });

export const timeHM = (date = new Date()) =>
  date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');

export const dateID = (date = new Date()) =>
  date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
