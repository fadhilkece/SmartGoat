import { COLORS } from '../theme';

export { COLORS };

export const APP_CONFIG = {
  NAME: 'SmartGoat',
  VERSION: '1.0.0',
  SPLASH_DURATION_MS: 1800,
};

export const TAB_ICONS = {
  Beranda: 'home',
  Ternak: 'paw',
  Kontrol: 'hardware-chip',
  Laporan: 'stats-chart',
};

export const SENSOR_LIMITS = {
  TEMP_MIN: 24,
  TEMP_MAX: 30,
  HUMIDITY_MIN: 60,
  HUMIDITY_MAX: 70,
  GOAT_FEVER_TEMP: 39.5,
  SILO_CAPACITY_KG: 200,
};

export const STORAGE_KEYS = {
  USER_SESSION: '@smartgoat_user_session',
  IOT_SETTINGS: '@smartgoat_iot_settings',
};