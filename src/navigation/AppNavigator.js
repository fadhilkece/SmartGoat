import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TAB_ICONS, APP_CONFIG } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useIoT } from '../context/IoTContext';
import {
  SplashScreen,
  LoginScreen,
  BerandaScreen,
  TernakScreen,
  GoatDetailScreen,
  KontrolScreen,
  LaporanScreen,
} from '../screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    primary: COLORS.primary,
    card: COLORS.surface,
    border: COLORS.border,
    text: COLORS.text,
  },
};

function MainTabs() {
  const { alerts } = useIoT();
  const unread = alerts.filter((a) => a.type !== 'info').length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, focused }) => {
          const base = TAB_ICONS[route.name];
          return <Ionicons name={focused ? base : `${base}-outline`} size={24} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
      })}
    >
      <Tab.Screen
        name="Beranda"
        component={BerandaScreen}
        options={{ tabBarBadge: unread > 0 ? Math.min(unread, 9) : undefined }}
      />
      <Tab.Screen name="Ternak" component={TernakScreen} />
      <Tab.Screen name="Kontrol" component={KontrolScreen} />
      <Tab.Screen name="Laporan" component={LaporanScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [minSplash, setMinSplash] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinSplash(true), APP_CONFIG.SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  if (loading || !minSplash) return <SplashScreen />;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainApp" component={MainTabs} />
            <Stack.Screen name="GoatDetail" component={GoatDetailScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}