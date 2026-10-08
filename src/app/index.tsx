import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityTabs } from '../components/ActivityTabs';
import { useActivities } from '../features/activities/useActivities';
import { activitiesOverlappingDate, calculateCategoryTotals, calculateStatistics, formatDuration } from '../features/activities/activityUtils';
import { formatDisplayTime, getDateKey } from '../utils/date';
import { useAppTheme } from '../theme/ThemeProvider';

export default function DashboardScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { activities, isLoading, error } = useActivities();
  const stats = calculateStatistics(activities);
  const today = getDateKey(new Date());
  const categoriesToday = calculateCategoryTotals(activities, today);
  const todayActivities = activitiesOverlappingDate(activities, today);
  const latest = todayActivities[0];
  const recent = todayActivities.slice(0, 4);
  return <View style={[styles.root, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(28, insets.top + 12) }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>YOUR DAY, IN FOCUS</Text>
      <Text style={[styles.heading, { color: colors.textPrimary }]}>Today</Text>
      <Text style={[styles.date, { color: colors.textSecondary }]}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      <View style={[styles.summary, { backgroundColor: colors.accent }]}>
        <Text style={styles.summaryLabel}>TIME TRACKED</Text>
        <Text style={styles.summaryValue}>{formatDuration(stats.todayMinutes)}</Text>
        <View style={styles.summaryFooter}><Text style={styles.summaryMeta}>{stats.todayCount} {stats.todayCount === 1 ? 'activity' : 'activities'}</Text><Ionicons name="time-outline" size={18} color="#FFFFFF" /></View>
        {latest ? <Text numberOfLines={1} style={styles.latest}>Most recent: {latest.title} · {latest.category}</Text> : null}
      </View>
      <TouchableOpacity style={[styles.add, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.push('/activity/new')} accessibilityRole="button" accessibilityLabel="Add an activity">
        <View style={[styles.addIcon, { backgroundColor: colors.accentSubtle }]}><Ionicons name="add" size={22} color={colors.accent} /></View>
        <View style={{ flex: 1 }}><Text style={[styles.addTitle, { color: colors.textPrimary }]}>Log an activity</Text><Text style={[styles.subtext, { color: colors.textSecondary }]}>Capture how you spend your time</Text></View><Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
      {error && <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>{error}</Text>}
      <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today’s rhythm</Text><TouchableOpacity onPress={() => router.push('/insights')}><Text style={{ color: colors.accent, fontWeight: '600' }}>Insights</Text></TouchableOpacity></View>
      {categoriesToday.slice(0, 3).map((item) => <View key={item.category} style={[styles.categoryRow, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={{ flex: 1 }}><Text style={[styles.categoryName, { color: colors.textPrimary }]}>{item.category}</Text><View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}><View style={[styles.fill, { backgroundColor: colors.accent, width: `${Math.max(8, Math.min(100, (item.minutes / Math.max(stats.todayMinutes, 1)) * 100))}%` }]} /></View></View><Text style={[styles.categoryTime, { color: colors.textSecondary }]}>{formatDuration(item.minutes)}</Text></View>)}
      <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent activities</Text><TouchableOpacity onPress={() => router.push('/history')}><Text style={{ color: colors.accent, fontWeight: '600' }}>See all</Text></TouchableOpacity></View>
      {isLoading ? <ActivityIndicator color={colors.accent} style={{ margin: 24 }} /> : recent.length ? recent.map((item) => <TouchableOpacity key={item.id} onPress={() => router.push(`/activity/${item.id}`)} style={[styles.activityRow, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.activityIcon, { backgroundColor: colors.accentSubtle }]}><Ionicons name="ellipse" size={8} color={colors.accent} /></View><View style={{ flex: 1 }}><Text style={[styles.categoryName, { color: colors.textPrimary }]}>{item.title}</Text><Text style={[styles.subtext, { color: colors.textSecondary }]}>{item.category} · {formatDisplayTime(item.startAt)}</Text></View><Text style={[styles.categoryTime, { color: colors.textSecondary }]}>{formatDuration(new Date(item.endAt).getTime() / 60000 - new Date(item.startAt).getTime() / 60000)}</Text></TouchableOpacity>) : <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.subtext, { color: colors.textSecondary }]}>Nothing logged yet. Add your first activity to get started.</Text></View>}
    </ScrollView><ActivityTabs />
  </View>;
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { padding: 22, paddingTop: 28, paddingBottom: 28 }, eyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '700' }, heading: { fontSize: 32, fontWeight: '800', marginTop: 6 }, date: { fontSize: 15, marginTop: 4, marginBottom: 22 }, summary: { borderRadius: 22, padding: 22, marginBottom: 14 }, summaryLabel: { color: '#D7F1EC', fontWeight: '700', fontSize: 11, letterSpacing: 1.2 }, summaryValue: { color: '#FFFFFF', fontSize: 42, fontWeight: '800', marginTop: 6 }, summaryFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }, summaryMeta: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' }, latest: { color: '#E5F6F2', fontSize: 12, marginTop: 10 }, add: { borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 26 }, addIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, addTitle: { fontSize: 15, fontWeight: '700' }, subtext: { fontSize: 13, marginTop: 4, lineHeight: 19 }, sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 }, sectionTitle: { fontSize: 18, fontWeight: '700' }, categoryRow: { borderWidth: 1, borderRadius: 14, padding: 13, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 14 }, categoryName: { fontSize: 14, fontWeight: '700' }, categoryTime: { fontSize: 13, fontWeight: '600' }, track: { height: 5, borderRadius: 4, marginTop: 9, overflow: 'hidden' }, fill: { height: 5, borderRadius: 4 }, activityRow: { borderWidth: 1, borderRadius: 14, padding: 13, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }, activityIcon: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, empty: { padding: 18, borderWidth: 1, borderRadius: 14 }, error: { marginBottom: 16 } });
