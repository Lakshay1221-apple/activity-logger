import { router, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeProvider';

const tabs = [
  { path: '/', label: 'Today', icon: 'sunny-outline' as const },
  { path: '/history', label: 'History', icon: 'calendar-outline' as const },
  { path: '/insights', label: 'Insights', icon: 'bar-chart-outline' as const },
  { path: '/journal', label: 'Journal', icon: 'book-outline' as const },
];

export function ActivityTabs() {
  const pathname = usePathname();
  const { colors } = useAppTheme();
  return <View style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    {tabs.map((tab) => {
      const active = pathname === tab.path;
      return <TouchableOpacity key={tab.path} onPress={() => router.replace(tab.path as never)} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={tab.label} style={styles.tab}>
        <Ionicons name={tab.icon} size={20} color={active ? colors.accent : colors.textMuted} />
        <Text style={{ color: active ? colors.accent : colors.textMuted, fontSize: 11, fontWeight: active ? '700' : '500' }}>{tab.label}</Text>
      </TouchableOpacity>;
    })}
  </View>;
}

const styles = StyleSheet.create({ bar: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 8, paddingBottom: 6 }, tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 48 } });
