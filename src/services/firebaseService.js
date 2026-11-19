import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';

// Ganti dengan konfigurasi dari Firebase Console Anda
const firebaseConfig = {
  apiKey: 'API_KEY_ANDA',
  authDomain: 'PROJECT_ID.firebaseapp.com',
  databaseURL: 'https://PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'PROJECT_ID',
  storageBucket: 'PROJECT_ID.appspot.com',
  messagingSenderId: 'SENDER_ID',
  appId: 'APP_ID',
};

let db = null;

export function initFirebase() {
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  }
  return db;
}

// Berlangganan data sensor real-time dari ESP32
export function subscribeTelemetry(callback) {
  const database = initFirebase();
  const telemetryRef = ref(database, 'kandang/telemetri');
  return onValue(telemetryRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
}

// Mengirim perintah kontrol aktuator ke ESP32 (kipas, kabut, pemanas)
export async function sendActuatorCommand(actuatorName, isActive) {
  const database = initFirebase();
  const actuatorRef = ref(database, 'kandang/aktuator');
  return update(actuatorRef, { [actuatorName]: isActive });
}

// Mengirim perintah tuang pakan manual ke ESP32
export async function triggerManualFeed(weightKg) {
  const database = initFirebase();
  const feedRef = ref(database, 'kandang/pakan_manual');
  return set(feedRef, {
    weightKg,
    triggeredAt: Date.now(),
    status: 'PENDING',
  });
}