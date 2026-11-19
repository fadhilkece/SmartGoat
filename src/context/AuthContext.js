import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'smartgoat:user';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {
        // abaikan: dianggap belum login
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Autentikasi lokal (demo). Ganti dengan Firebase Auth / API saat backend siap.
  const signIn = useCallback(async (username, password) => {
    if (!username.trim() || password.length < 4) {
      throw new Error('Username wajib diisi dan password minimal 4 karakter.');
    }
    const next = { username: username.trim(), farm: 'Peternakan SmartGoat' };
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    setUser(next);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(KEY);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
