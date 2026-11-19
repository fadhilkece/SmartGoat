import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import { IoTProvider } from './src/context/IoTContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <IoTProvider>
          <AppNavigator />
        </IoTProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}