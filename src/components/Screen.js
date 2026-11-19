import React from 'react';
import { ScrollView, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme';

/** Kerangka layar standar: safe area + scroll + padding konsisten. */
export default function Screen({ children, scroll = true, style, contentStyle, refreshControl }) {
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: COLORS.background }, style]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Body
        {...(scroll ? { showsVerticalScrollIndicator: false, refreshControl, keyboardShouldPersistTaps: 'handled' } : {})}
        contentContainerStyle={scroll ? [{ padding: 20, paddingBottom: 32 }, contentStyle] : undefined}
        style={scroll ? undefined : [{ flex: 1, padding: 20 }, contentStyle]}
      >
        {children}
      </Body>
    </SafeAreaView>
  );
}
