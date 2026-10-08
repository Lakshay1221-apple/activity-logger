import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useActivities } from '../../features/activities/useActivities';
import { ACTIVITY_CATEGORIES, type ActivityDraft } from '../../features/activities/activityTypes';
import { validateActivity, type ActivityValidationErrors } from '../../features/activities/activityUtils';
import { getDateKey } from '../../utils/date';

interface ActivityFormValues extends ActivityDraft { date: string }

function initialValues(): ActivityFormValues {
  const now = new Date();
  const start = new Date(now.getTime() - 60 * 60_000);
  const time = (date: Date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return { title: '', category: 'Work', startAt: time(start), endAt: time(now), notes: '', tags: [], date: getDateKey(now) };
}

function toTimestamp(date: string, time: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return '';
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return '';
  const value = new Date(year, month - 1, day, hour, minute);
  if (value.getFullYear() !== year || value.getMonth() !== month - 1 || value.getDate() !== day || value.getHours() !== hour || value.getMinutes() !== minute) return '';
  return value.toISOString();
}

export default function ActivityFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { activities, isLoading, create, update } = useActivities();
  const editing = id ? activities.find((activity) => activity.id === id) : undefined;
  const [formOverride, setFormOverride] = useState<ActivityFormValues | null>(() => id ? null : initialValues());
  const form = formOverride ?? (editing ? { title: editing.title, category: editing.category, date: getDateKey(editing.startAt), startAt: `${String(new Date(editing.startAt).getHours()).padStart(2, '0')}:${String(new Date(editing.startAt).getMinutes()).padStart(2, '0')}`, endAt: `${String(new Date(editing.endAt).getHours()).padStart(2, '0')}:${String(new Date(editing.endAt).getMinutes()).padStart(2, '0')}`, notes: editing.notes, tags: editing.tags } : initialValues());
  const [tagsOverride, setTagsOverride] = useState<string | null>(null);
  const tagsText = tagsOverride ?? editing?.tags.join(', ') ?? '';
  const [errors, setErrors] = useState<ActivityValidationErrors>({});
  const [saving, setSaving] = useState(false);

  const customCategory = ACTIVITY_CATEGORIES.includes(form.category as (typeof ACTIVITY_CATEGORIES)[number]) ? '' : form.category;
  const categories = useMemo(() => [...new Set([...ACTIVITY_CATEGORIES, ...(customCategory ? [customCategory] : [])])], [customCategory]);
  const setField = (key: keyof ActivityFormValues, value: string) => setFormOverride((previous) => ({ ...(previous ?? form), [key]: value }));

  const handleSave = async () => {
    const startAt = toTimestamp(form.date, form.startAt);
    const sameDayEnd = toTimestamp(form.date, form.endAt);
    const endDate = startAt && sameDayEnd && new Date(sameDayEnd).getTime() <= new Date(startAt).getTime()
      ? getDateKey(new Date(new Date(`${form.date}T12:00:00`).getTime() + 86_400_000))
      : form.date;
    const draft = { ...form, startAt, endAt: toTimestamp(endDate, form.endAt), tags: tagsText.split(',') };
    const nextErrors = validateActivity(draft);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(form.date)) || !draft.startAt) nextErrors.startAt = 'Enter a valid date and start time.';
    if (!draft.endAt && !nextErrors.endAt) nextErrors.endAt = 'Enter a valid date and end time.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      if (editing) await update(editing.id, draft);
      else await create(draft);
      router.replace('/history');
    } catch (cause) {
      Alert.alert('Could not save activity', cause instanceof Error ? cause.message : 'Please try again.');
    } finally { setSaving(false); }
  };

  if (id && isLoading) return <View style={[styles.root, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={colors.accent} /></View>;
  if (id && !editing) return <View style={[styles.root, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }]}><Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }}>Activity not found</Text><TouchableOpacity onPress={() => router.replace('/history')} style={[styles.save, { backgroundColor: colors.accent, paddingHorizontal: 20 }]}><Text style={styles.saveText}>Back to history</Text></TouchableOpacity></View>;

  return <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.header}><TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity><Text style={[styles.heading, { color: colors.textPrimary }]}>{editing ? 'Edit activity' : 'New activity'}</Text><View style={{ width: 40 }} /></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Field label="ACTIVITY NAME" value={form.title} onChangeText={(value) => setField('title', value)} placeholder="e.g. Project planning" colors={colors} error={errors.title} />
      <Text style={[styles.label, { color: colors.textSecondary }]}>CATEGORY</Text><View style={styles.chips}>{categories.map((category) => <TouchableOpacity key={category} onPress={() => setField('category', category)} style={[styles.chip, { backgroundColor: form.category === category ? colors.accent : colors.surface, borderColor: form.category === category ? colors.accent : colors.border }]}><Text style={{ color: form.category === category ? '#fff' : colors.textSecondary, fontSize: 13, fontWeight: '600' }}>{category}</Text></TouchableOpacity>)}</View>{errors.category ? <Text style={{ color: colors.danger }}>{errors.category}</Text> : null}<Field label="OR ADD A CATEGORY" value={customCategory} onChangeText={(value) => setField('category', value || 'Other')} placeholder="e.g. Cooking" colors={colors} />
      <Field label="DATE (YYYY-MM-DD)" value={String(form.date)} onChangeText={(value) => setField('date', value)} placeholder="2026-10-08" colors={colors} />
      <View style={styles.times}><View style={{ flex: 1 }}><Field label="START (HH:MM)" value={form.startAt} onChangeText={(value) => setField('startAt', value)} placeholder="09:00" colors={colors} error={errors.startAt} /></View><View style={{ flex: 1 }}><Field label="END (HH:MM)" value={form.endAt} onChangeText={(value) => setField('endAt', value)} placeholder="10:00" colors={colors} error={errors.endAt} /></View></View>
      <Field label="NOTES (OPTIONAL)" value={form.notes ?? ''} onChangeText={(value) => setField('notes', value)} placeholder="Add context or a quick reflection" colors={colors} multiline />
      <Field label="TAGS (OPTIONAL, COMMA-SEPARATED)" value={tagsText} onChangeText={(value) => setTagsOverride(value)} placeholder="focus, deep work" colors={colors} />
      <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={() => void handleSave()} style={[styles.save, { backgroundColor: colors.accent, opacity: saving ? 0.65 : 1 }]}><Text style={styles.saveText}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Save activity'}</Text></TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function Field({ label, value, onChangeText, placeholder, colors, error, multiline }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; colors: ReturnType<typeof useAppTheme>['colors']; error?: string; multiline?: boolean }) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border, height: multiline ? 100 : 50 }]} accessibilityLabel={label} />{error ? <Text style={{ color: colors.danger, fontSize: 12, marginTop: 5 }}>{error}</Text> : null}</View>;
}

const styles = StyleSheet.create({ root: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 }, back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }, heading: { fontSize: 19, fontWeight: '700' }, content: { paddingHorizontal: 20, paddingBottom: 32 }, field: { marginBottom: 16 }, label: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }, input: { borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, fontSize: 15 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }, chip: { borderWidth: 1, borderRadius: 16, paddingVertical: 9, paddingHorizontal: 12 }, times: { flexDirection: 'row', gap: 12 }, save: { minHeight: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 8 }, saveText: { color: '#fff', fontSize: 15, fontWeight: '700' } });
