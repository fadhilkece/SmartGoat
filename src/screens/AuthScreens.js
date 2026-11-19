import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONT, SHADOW } from '../theme';
import { Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export function Logo({ size = 88, light = false }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: light ? 'rgba(255,255,255,0.18)' : COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name="sheep" size={size * 0.55} color={light ? '#fff' : COLORS.primary} />
    </View>
  );
}

export function SplashScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, [fade, scale]);

  return (
    <View style={[st.center, { backgroundColor: COLORS.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Animated.View style={{ opacity: fade, transform: [{ scale }], alignItems: 'center' }}>
        <Logo size={110} light />
        <Text style={st.splashTitle}>SmartGoat</Text>
        <Text style={st.splashSub}>IoT Farming System</Text>
      </Animated.View>
    </View>
  );
}

export function LoginScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const passRef = useRef(null);

  const submit = async () => {
    setBusy(true);
    try {
      await signIn(username, password);
    } catch (e) {
      Alert.alert('Login gagal', e.message);
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Logo />
            <Text style={[FONT.title, { marginTop: 16 }]}>Masuk ke SmartGoat</Text>
            <Text style={[FONT.small, { marginTop: 4 }]}>Pantau dan kendalikan kandang dari satu aplikasi</Text>
          </View>

          <View style={st.form}>
            <Text style={FONT.label}>Username</Text>
            <View style={st.field}>
              <Ionicons name="person-outline" size={20} color={COLORS.textLight} />
              <TextInput
                style={st.input}
                placeholder="mis. peternak01"
                placeholderTextColor={COLORS.textLight}
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={setUsername}
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
              />
            </View>

            <Text style={[FONT.label, { marginTop: 16 }]}>Password</Text>
            <View style={st.field}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} />
              <TextInput
                ref={passRef}
                style={st.input}
                placeholder="Minimal 4 karakter"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry={!show}
                value={password}
                onChangeText={setPassword}
                returnKeyType="go"
                onSubmitEditing={submit}
              />
              <TouchableOpacity onPress={() => setShow((v) => !v)} hitSlop={10}>
                <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            <Button title="Masuk ke Dashboard" onPress={submit} loading={busy} style={{ marginTop: 24 }} />
          </View>

          <Text style={[FONT.small, { textAlign: 'center', marginTop: 20 }]}>Mode demo: kredensial apa pun diterima (password ≥ 4 karakter).</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  splashTitle: { fontSize: 34, fontWeight: '800', color: '#fff', marginTop: 18 },
  splashSub: { color: COLORS.primaryLight, marginTop: 4, fontSize: 14 },
  form: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 20, borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: RADIUS.md, paddingHorizontal: 14, height: 50, marginTop: 8, borderWidth: 1, borderColor: COLORS.border },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: COLORS.text },
});
