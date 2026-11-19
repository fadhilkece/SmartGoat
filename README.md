# SmartGoat — IoT Farming App (Expo)

## Menjalankan
```bash
npm install
npx expo install --fix     # menyelaraskan versi paket dengan SDK 58
npx expo start             # scan QR dengan Expo Go
```
> Kamera (`expo-camera`) dan `expo-print`/`expo-sharing` ada di Expo Go. Jika ada modul native lain yang ditambah, gunakan development build.

## Struktur
- `App.js` — provider + navigasi (Splash → Login → Tab: Beranda, Ternak, Kontrol, Laporan; stack: Detail Ternak)
- `src/theme.js` — warna, radius, tipografi
- `src/context/IoTContext.js` — state telemetri & aktuator (simulator + kontrol otomatis). **Titik integrasi hardware.**
- `src/context/AuthContext.js` — login lokal (ganti ke Firebase Auth)
- `src/data/goats.js` — data ternak simulasi
- `src/components/` — komponen UI bersama
- `src/screens/` — layar

## Integrasi hardware (langkah berikutnya)
Di `IoTContext.js`, ganti simulator `TICK` dengan langganan MQTT / Firebase RTDB lalu `dispatch({type:'TICK'...})`
dengan data sensor nyata; kirim perintah aktuator di `setActuator` / `dispense`.
