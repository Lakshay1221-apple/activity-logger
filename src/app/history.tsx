import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityTabs } from '../components/ActivityTabs';
import { useActivities } from '../features/activities/useActivities';
import { calculateStatistics, formatDuration, groupActivitiesByDate } from '../features/activities/activityUtils';
import { formatDayHeader, formatDisplayTime } from '../utils/date';
import { useAppTheme } from '../theme/ThemeProvider';

export default function HistoryScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { activities, isLoading, error, refresh } = useActivities();
  const groups = groupActivitiesByDate(activities);
  return <View style={[styles.root, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(28, insets.top + 12) }]} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} tintColor={colors.accent} />} >
      <Text style={[styles.eyebrow, { color: colors.accent }]}>YOUR JOURNAL</Text><Text style={[styles.heading, { color: colors.textPrimary }]}>History</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>A clear view of where your time went.</Text>
      {error && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>}
      {isLoading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 36 }} /> : groups.length === 0 ? <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Your history starts here</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Log an activity and it will appear in this timeline.</Text><TouchableOpacity onPress={() => router.push('/activity/new')} style={[styles.button, { backgroundColor: colors.accent }]}><Text style={{ color: '#fff', fontWeight: '700' }}>Add activity</Text></TouchableOpacity></View> : groups.map((group) => { const date = formatDayHeader(group.dateKey); const total = calculateStatistics(group.activities, group.dateKey).todayMinutes; return <View key={group.dateKey} style={{ marginTop: 24 }}><View style={styles.dateLine}><View><Text style={[styles.dateTitle, { color: colors.textPrimary }]}>{date.title}</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>{date.subtitle}</Text></View><Text style={{ color: colors.accent, fontWeight: '700' }}>{formatDuration(total)}</Text></View>{group.activities.map((item) => <TouchableOpacity key={item.id} onPress={() => router.push(`/activity/${item.id}`)} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={{ flex: 1 }}><Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>{item.category} · {formatDisplayTime(item.startAt)}–{formatDisplayTime(item.endAt)}</Text>{item.notes ? <Text numberOfLines={2} style={[styles.subtitle, { color: colors.textSecondary }]}>{item.notes}</Text> : null}</View><Text style={[styles.duration, { color: colors.textPrimary }]}>{formatDuration(new Date(item.endAt).getTime() / 60000 - new Date(item.startAt).getTime() / 60000)}</Text></TouchableOpacity>)}</View>; })}
    </ScrollView><ActivityTabs />
  </View>;
}
const styles = StyleSheet.create({ root: { flex: 1 }, content: { padding: 22, paddingTop: 28, paddingBottom: 30 }, eyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '700' }, heading: { fontSize: 32, fontWeight: '800', marginTop: 6 }, subtitle: { fontSize: 13, marginTop: 4, lineHeight: 19 }, dateLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, dateTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 1 }, card: { borderWidth: 1, borderRadius: 15, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }, title: { fontSize: 15, fontWeight: '700' }, duration: { fontSize: 13, fontWeight: '700' }, empty: { marginTop: 36, padding: 20, borderRadius: 18, borderWidth: 1, alignItems: 'center' }, emptyTitle: { fontSize: 17, fontWeight: '700' }, button: { marginTop: 18, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 } });
