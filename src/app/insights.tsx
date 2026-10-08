import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityTabs } from '../components/ActivityTabs';
import { useActivities } from '../features/activities/useActivities';
import { calculateStatistics, formatDuration } from '../features/activities/activityUtils';
import { useAppTheme } from '../theme/ThemeProvider';

export default function InsightsScreen() {
  const { colors } = useAppTheme();
  const { activities, isLoading, error } = useActivities();
  const stats = calculateStatistics(activities);
  const maxCategory = Math.max(1, ...stats.categoryMinutes.map((x) => x.minutes));
  const maxDay = Math.max(1, ...stats.dailyMinutes.slice(-7).map((x) => x.minutes));
  return <View style={[styles.root, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>PATTERNS & PROGRESS</Text><Text style={[styles.heading, { color: colors.textPrimary }]}>Insights</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Small signals from your activity history.</Text>
      {error && <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>}
      {isLoading ? <ActivityIndicator color={colors.accent} style={{ margin: 30 }} /> : <>
        <View style={styles.metrics}><Metric title="Tracked" value={formatDuration(stats.totalMinutes)} colors={colors} /><Metric title="Today" value={formatDuration(stats.todayMinutes)} colors={colors} /><Metric title="Activities" value={String(stats.totalCount)} colors={colors} /></View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Top category</Text><Text style={[styles.top, { color: colors.accent }]}>{stats.mostUsedCategory ?? 'No data yet'}</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Based on recorded time across your history.</Text></View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Time by category</Text>{stats.categoryMinutes.length ? stats.categoryMinutes.map((item) => <View key={item.category} style={styles.barRow}><View style={styles.barLabel}><Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{item.category}</Text><Text style={{ color: colors.textSecondary }}>{formatDuration(item.minutes)}</Text></View><View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}><View style={[styles.fill, { backgroundColor: colors.accent, width: `${Math.max(5, item.minutes / maxCategory * 100)}%` }]} /></View></View>) : <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Log activities to see your category breakdown.</Text>}</View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Daily totals</Text>{stats.dailyMinutes.length ? stats.dailyMinutes.slice(-7).map((item) => <View key={item.dateKey} style={styles.barRow}><View style={styles.barLabel}><Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{new Date(`${item.dateKey}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Text><Text style={{ color: colors.textSecondary }}>{formatDuration(item.minutes)}</Text></View><View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}><View style={[styles.fill, { backgroundColor: colors.accent, width: `${Math.max(5, item.minutes / maxDay * 100)}%` }]} /></View></View>) : <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your daily trend will appear here.</Text>}</View>
      </>}
    </ScrollView><ActivityTabs />
  </View>;
}
function Metric({ title, value, colors }: { title: string; value: string; colors: ReturnType<typeof useAppTheme>['colors'] }) { return <View style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.subtitle, { color: colors.textSecondary }]}>{title}</Text><Text style={[styles.metricValue, { color: colors.textPrimary }]}>{value}</Text></View>; }
const styles = StyleSheet.create({ root: { flex: 1 }, content: { padding: 22, paddingTop: 28, paddingBottom: 32 }, eyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '700' }, heading: { fontSize: 32, fontWeight: '800', marginTop: 6 }, subtitle: { fontSize: 13, marginTop: 4, lineHeight: 19 }, metrics: { flexDirection: 'row', gap: 10, marginTop: 22 }, metric: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1 }, metricValue: { fontSize: 24, fontWeight: '800', marginTop: 8 }, card: { padding: 16, borderRadius: 17, borderWidth: 1, marginTop: 12 }, cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 }, top: { fontSize: 26, fontWeight: '800' }, barRow: { marginTop: 10 }, barLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }, track: { height: 7, borderRadius: 5, overflow: 'hidden' }, fill: { height: 7, borderRadius: 5 } });
