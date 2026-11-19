import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveStorage(key, value) {
  const serialized = JSON.stringify(value);
  await AsyncStorage.setItem(key, serialized);
}

export async function getStorage(key) {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

export async function removeStorage(key) {
  await AsyncStorage.removeItem(key);
}