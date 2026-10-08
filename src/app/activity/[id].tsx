import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useActivities } from '../../features/activities/useActivities';
import { calculateDurationMinutes, formatDuration } from '../../features/activities/activityUtils';
import { formatDayHeader, formatDisplayTime, getDateKey } from '../../utils/date';

export default function ActivityDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { activities, isLoading, error, remove } = useActivities();
  const activity = activities.find((item) => item.id === id);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    if (!isLoading && !activity && !error) router.replace('/history');
  }, [activity, error, isLoading]);

  const confirmDelete = () => Alert.alert('Delete activity?', 'This activity will be permanently removed from this device.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => { setDeleting(true); void remove(id).then(() => router.replace('/history')).catch(() => Alert.alert('Delete failed', 'Please try again.')).finally(() => setDeleting(false)); } },
  ]);

  if (isLoading || !activity) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.accent} />{error ? <Text style={{ color: colors.danger, marginTop: 12 }}>{error}</Text> : null}</View>;
  const day = formatDayHeader(getDateKey(activity.startAt));
  return <View style={[styles.root, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}><TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity><Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Activity details</Text><View style={{ width: 42 }} /></View>
      <View style={[styles.hero, { backgroundColor: colors.accent }]}><Text style={styles.category}>{activity.category.toUpperCase()}</Text><Text style={styles.title}>{activity.title}</Text><Text style={styles.duration}>{formatDuration(calculateDurationMinutes(activity))}</Text></View>
      <InfoRow label="DATE" value={`${day.title} · ${day.subtitle}`} colors={colors} />
      <InfoRow label="TIME" value={`${formatDisplayTime(activity.startAt)} — ${formatDisplayTime(activity.endAt)}`} colors={colors} />
      {activity.notes ? <InfoRow label="NOTES" value={activity.notes} colors={colors} /> : null}
      {activity.tags.length > 0 ? <View style={[styles.info, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.label, { color: colors.textMuted }]}>TAGS</Text><View style={styles.tags}>{activity.tags.map((tag) => <Text key={tag} style={[styles.tag, { backgroundColor: colors.accentSubtle, color: colors.accent }]}>{tag}</Text>)}</View></View> : null}
      <InfoRow label="CREATED" value={new Date(activity.createdAt).toLocaleString()} colors={colors} />
      <InfoRow label="LAST UPDATED" value={new Date(activity.updatedAt).toLocaleString()} colors={colors} />
      <View style={styles.actions}><TouchableOpacity onPress={() => router.push({ pathname: '/activity/new', params: { id: activity.id } })} style={[styles.action, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityRole="button"><Ionicons name="pencil-outline" size={18} color={colors.textPrimary} /><Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Edit</Text></TouchableOpacity><TouchableOpacity disabled={deleting} onPress={confirmDelete} style={[styles.action, { backgroundColor: colors.dangerSubtle, borderColor: colors.dangerSubtle }]} accessibilityRole="button" accessibilityLabel="Delete activity"><Ionicons name="trash-outline" size={18} color={colors.danger} /><Text style={{ color: colors.danger, fontWeight: '700' }}>{deleting ? 'Deleting…' : 'Delete'}</Text></TouchableOpacity></View>
    </ScrollView>
  </View>;
}
function InfoRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useAppTheme>['colors'] }) { return <View style={[styles.info, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text><Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text></View>; }
const styles = StyleSheet.create({ root: { flex: 1 }, content: { padding: 20, paddingBottom: 34 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }, back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' }, headerTitle: { fontWeight: '700', fontSize: 17 }, hero: { padding: 22, borderRadius: 22, marginBottom: 14 }, category: { color: '#D7F1EC', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 }, title: { color: '#FFFFFF', fontSize: 27, fontWeight: '800', marginTop: 8 }, duration: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 12 }, info: { padding: 16, borderRadius: 15, borderWidth: 1, marginBottom: 9 }, label: { fontSize: 10, fontWeight: '700', letterSpacing: 1 }, value: { fontSize: 15, lineHeight: 22, marginTop: 6 }, tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 }, tag: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, overflow: 'hidden', fontSize: 12 }, actions: { flexDirection: 'row', gap: 10, marginTop: 12 }, action: { flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 } });
