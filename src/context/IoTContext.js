import React, { createContext, useContext, useEffect, useReducer, useRef, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clamp, timeHM } from '../utils/format';

/**
 * IoTContext — sumber data tunggal untuk telemetri kandang & aktuator.
 * Saat ini memakai SIMULATOR. Untuk hardware nyata, ganti isi `tick()`
 * dengan subscribe MQTT/Firebase RTDB dan panggil dispatch({type:'TELEMETRY', ...}).
 */

const STORAGE_KEY = 'smartgoat:settings:v1';
const TICK_MS = 3000;
const HISTORY_LEN = 20;
export const FEEDER_CAPACITY = 200;
const FEEDER_GROUPS = 6; // jumlah titik pakan yang dilayani per sesi (untuk estimasi stok)

const initialState = {
  hydrated: false,
  connected: true,
  mode: 'auto', // 'auto' | 'manual'
  temp: 29.2,
  humidity: 66,
  tempHistory: Array.from({ length: HISTORY_LEN }, (_, i) => 28 + Math.sin(i / 3) * 1.2),
  targetTemp: 28,
  actuators: { fan: true, mist: false, heater: false },
  feeder: { level: 150, portion: 2.5, lastDispense: null },
  schedules: [
    { id: 's1', time: '07:00', label: 'Sesi Pagi', icon: 'sunny', formula: '2,5 kg Pelet Fermentasi + Rumput Odot Cacah', enabled: true },
    { id: 's2', time: '16:00', label: 'Sesi Sore', icon: 'partly-sunny', formula: '2,5 kg Konsentrat Protein Tinggi & Mineral', enabled: true },
  ],
  alerts: [],
};

const SAFE_MIN = 24;
const SAFE_MAX = 30;

function pushAlert(state, type, message) {
  const last = state.alerts[0];
  if (last && last.message === message && Date.now() - last.ts < 60000) return state.alerts; // dedupe 1 menit
  const item = { id: String(Date.now()) + Math.random().toString(36).slice(2, 5), type, message, time: timeHM(), ts: Date.now() };
  return [item, ...state.alerts].slice(0, 30);
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };
    case 'TICK': {
      const { actuators, temp, humidity, targetTemp, mode } = state;
      // Fisika sederhana: ambient menarik suhu ke 31°C, aktuator menggeser suhu.
      let t = temp + (31 - temp) * 0.06 + (Math.random() - 0.5) * 0.5;
      if (actuators.fan) t -= 0.35;
      if (actuators.mist) t -= 0.45;
      if (actuators.heater) t += 0.6;
      t = clamp(t, 18, 38);

      let h = humidity + (62 - humidity) * 0.05 + (Math.random() - 0.5) * 1.2;
      if (actuators.mist) h += 2.5;
      if (actuators.fan) h -= 0.8;
      h = clamp(h, 35, 95);

      // Kontrol otomatis (histeresis 0.8°C agar relay tidak "chattering").
      let next = actuators;
      if (mode === 'auto') {
        next = { ...actuators };
        if (t > targetTemp + 1) next.fan = true;
        else if (t < targetTemp - 0.8) next.fan = false;
        if (t > targetTemp + 2) next.mist = true;
        else if (t < targetTemp + 0.5) next.mist = false;
        if (t < targetTemp - 2) next.heater = true;
        else if (t > targetTemp - 0.5) next.heater = false;
      }

      let alerts = state.alerts;
      const draft = { ...state, alerts };
      if (t > SAFE_MAX + 2) alerts = pushAlert(draft, 'danger', `Suhu kandang kritis: ${t.toFixed(1)}°C`);
      else if (t > SAFE_MAX) alerts = pushAlert(draft, 'warning', `Suhu kandang di atas batas aman (${t.toFixed(1)}°C)`);
      else if (t < SAFE_MIN) alerts = pushAlert(draft, 'warning', `Suhu kandang di bawah batas aman (${t.toFixed(1)}°C)`);

      return {
        ...state,
        temp: t,
        humidity: h,
        actuators: next,
        alerts,
        tempHistory: [...state.tempHistory.slice(-(HISTORY_LEN - 1)), t],
      };
    }
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_TARGET':
      return { ...state, targetTemp: clamp(Math.round(action.value * 2) / 2, 24, 32) };
    case 'SET_ACTUATOR':
      // Mengubah aktuator manual otomatis memindahkan ke mode manual.
      return { ...state, mode: 'manual', actuators: { ...state.actuators, [action.key]: action.value } };
    case 'SET_PORTION':
      return { ...state, feeder: { ...state.feeder, portion: clamp(Math.round(action.value * 2) / 2, 0.5, 5) } };
    case 'DISPENSE': {
      const { level, portion } = state.feeder;
      if (level < portion) {
        return { ...state, alerts: pushAlert(state, 'danger', 'Stok pakan tidak cukup untuk dispensing') };
      }
      const nl = Math.max(0, level - portion);
      let alerts = state.alerts;
      const info = pushAlert(state, 'info', `Pakan ${portion.toString().replace('.', ',')} kg dikeluarkan (${action.source})`);
      alerts = info;
      if (nl < FEEDER_CAPACITY * 0.2) alerts = pushAlert({ ...state, alerts }, 'warning', `Stok silo menipis: ${nl.toFixed(0)} kg`);
      return { ...state, alerts, feeder: { ...state.feeder, level: nl, lastDispense: timeHM() } };
    }
    case 'REFILL':
      return {
        ...state,
        feeder: { ...state.feeder, level: FEEDER_CAPACITY },
        alerts: pushAlert(state, 'info', 'Silo pakan diisi penuh'),
      };
    case 'TOGGLE_SCHEDULE':
      return { ...state, schedules: state.schedules.map((s) => (s.id === action.id ? { ...s, enabled: !s.enabled } : s)) };
    case 'ADD_SCHEDULE':
      return { ...state, schedules: [...state.schedules, action.schedule].sort((a, b) => a.time.localeCompare(b.time)) };
    case 'REMOVE_SCHEDULE':
      return { ...state, schedules: state.schedules.filter((s) => s.id !== action.id) };
    case 'CLEAR_ALERTS':
      return { ...state, alerts: [] };
    default:
      return state;
  }
}

const IoTContext = createContext(null);

export function IoTProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const firedRef = useRef(new Set());

  // Muat pengaturan tersimpan
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          dispatch({ type: 'HYDRATE', payload: saved });
          return;
        }
      } catch {
        // pakai default
      }
      dispatch({ type: 'HYDRATE', payload: {} });
    })();
  }, []);

  // Simpan pengaturan penting saat berubah
  useEffect(() => {
    if (!state.hydrated) return;
    const { mode, targetTemp, feeder, schedules } = state;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mode, targetTemp, schedules, feeder: { ...feeder } })
    ).catch(() => {});
  }, [state.hydrated, state.mode, state.targetTemp, state.feeder, state.schedules]);

  // Simulator telemetri + eksekusi jadwal pakan (selama aplikasi terbuka)
  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'TICK' });
      const now = timeHM();
      const key = new Date().toDateString() + now;
      stateRef.current.schedules.forEach((s) => {
        const k = key + s.id;
        if (s.enabled && s.time === now && !firedRef.current.has(k)) {
          firedRef.current.add(k);
          dispatch({ type: 'DISPENSE', source: s.label });
        }
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const api = useMemo(
    () => ({
      setMode: (mode) => dispatch({ type: 'SET_MODE', mode }),
      setTarget: (value) => dispatch({ type: 'SET_TARGET', value }),
      setActuator: (key, value) => dispatch({ type: 'SET_ACTUATOR', key, value }),
      setPortion: (value) => dispatch({ type: 'SET_PORTION', value }),
      dispense: () => dispatch({ type: 'DISPENSE', source: 'manual' }),
      refill: () => dispatch({ type: 'REFILL' }),
      toggleSchedule: (id) => dispatch({ type: 'TOGGLE_SCHEDULE', id }),
      addSchedule: (schedule) => dispatch({ type: 'ADD_SCHEDULE', schedule }),
      removeSchedule: (id) => dispatch({ type: 'REMOVE_SCHEDULE', id }),
      clearAlerts: () => dispatch({ type: 'CLEAR_ALERTS' }),
    }),
    []
  );

  const derived = useMemo(() => {
    const enabled = state.schedules.filter((s) => s.enabled).length;
    const dailyUse = enabled * state.feeder.portion * FEEDER_GROUPS;
    const daysLeft = dailyUse > 0 ? state.feeder.level / dailyUse : null;
    return {
      daysLeft,
      levelPct: (state.feeder.level / FEEDER_CAPACITY) * 100,
      tempStatus: state.temp > SAFE_MAX ? 'high' : state.temp < SAFE_MIN ? 'low' : 'ok',
      humidityStatus: state.humidity >= 60 && state.humidity <= 70 ? 'ok' : 'off',
    };
  }, [state.schedules, state.feeder, state.temp, state.humidity]);

  return <IoTContext.Provider value={{ ...state, ...derived, ...api }}>{children}</IoTContext.Provider>;
}

export const useIoT = () => useContext(IoTContext);
export const SAFE_RANGE = { min: SAFE_MIN, max: SAFE_MAX };
