import type { Activity, ActivityDateGroup, ActivityDraft, ActivityStatistics } from './activityTypes';
import { formatToISOWithOffset, getDateKey } from '../../utils/date';

export interface ActivityValidationErrors {
  title?: string;
  category?: string;
  startAt?: string;
  endAt?: string;
}

export function validateActivity(draft: ActivityDraft): ActivityValidationErrors {
  const errors: ActivityValidationErrors = {};
  if (!draft.title.trim()) errors.title = 'Enter an activity name.';
  if (!draft.category.trim()) errors.category = 'Choose a category.';
  const start = new Date(draft.startAt).getTime();
  const end = new Date(draft.endAt).getTime();
  if (!Number.isFinite(start)) errors.startAt = 'Enter a valid start time.';
  if (!Number.isFinite(end)) errors.endAt = 'Enter a valid end time.';
  else if (Number.isFinite(start) && end <= start) errors.endAt = 'End time must be after the start time.';
  return errors;
}

export function calculateDurationMinutes(activity: Pick<Activity, 'startAt' | 'endAt'>): number {
  const duration = new Date(activity.endAt).getTime() - new Date(activity.startAt).getTime();
  return Number.isFinite(duration) && duration > 0 ? Math.round(duration / 60_000) : 0;
}

export function formatDuration(minutes: number): string {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainder = safeMinutes % 60;
  if (hours === 0) return `${remainder}m`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

export function sortActivities(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
}

export function groupActivitiesByDate(activities: Activity[]): ActivityDateGroup[] {
  const groups = new Map<string, Activity[]>();
  for (const activity of sortActivities(activities)) {
    const key = getDateKey(activity.startAt);
    const items = groups.get(key) ?? [];
    items.push(activity);
    groups.set(key, items);
  }
  return [...groups.entries()].map(([dateKey, items]) => ({ dateKey, activities: items }));
}

function overlapMinutes(activity: Activity, startMs: number, endMs: number): number {
  const start = new Date(activity.startAt).getTime();
  const end = new Date(activity.endAt).getTime();
  return Math.max(0, Math.min(end, endMs) - Math.max(start, startMs)) / 60_000;
}

export function activitiesOverlappingDate(activities: Activity[], dateKey: string): Activity[] {
  const [year, month, day] = dateKey.split('-').map(Number);
  const startOfDay = new Date(year, month - 1, day);
  if (!Number.isFinite(startOfDay.getTime()) || getDateKey(startOfDay) !== dateKey) return [];
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  const startMs = startOfDay.getTime();
  const endMs = endOfDay.getTime();
  return sortActivities(activities).filter((activity) => {
    const start = new Date(activity.startAt).getTime();
    const end = new Date(activity.endAt).getTime();
    return Number.isFinite(start) && Number.isFinite(end) && end > start && start < endMs && end > startMs;
  });
}

export function calculateCategoryTotals(activities: Activity[], dateKey?: string): { category: string; minutes: number }[] {
  let rangeStart: number | undefined;
  let rangeEnd: number | undefined;
  if (dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    rangeStart = new Date(year, month - 1, day).getTime();
    rangeEnd = new Date(year, month - 1, day + 1).getTime();
  }
  const totals = new Map<string, number>();
  for (const activity of activities) {
    const start = new Date(activity.startAt).getTime();
    const end = new Date(activity.endAt).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    const minutes = rangeStart === undefined || rangeEnd === undefined
      ? (end - start) / 60_000
      : overlapMinutes(activity, rangeStart, rangeEnd);
    if (minutes > 0) totals.set(activity.category, (totals.get(activity.category) ?? 0) + minutes);
  }
  return [...totals.entries()].map(([category, minutes]) => ({ category, minutes: Math.round(minutes) })).sort((a, b) => b.minutes - a.minutes);
}

export function calculateStatistics(activities: Activity[], todayKey = getDateKey(new Date())): ActivityStatistics {
  const [year, month, day] = todayKey.split('-').map(Number);
  const todayStart = new Date(year, month - 1, day).getTime();
  const dayEnd = new Date(year, month - 1, day + 1).getTime();
  const latestDayEnd = new Date(todayStart);
  latestDayEnd.setDate(latestDayEnd.getDate() + 1);
  const latestDayStart = new Date(todayStart);
  latestDayStart.setDate(latestDayStart.getDate() - 6);
  const byCategory = new Map<string, number>();
  const byDate = new Map<string, number>();
  for (let cursor = new Date(latestDayStart); cursor.getTime() < latestDayEnd.getTime(); cursor.setDate(cursor.getDate() + 1)) {
    byDate.set(getDateKey(cursor), 0);
  }
  let todayMinutes = 0;
  let todayCount = 0;
  let validCount = 0;

  for (const activity of activities) {
    const start = new Date(activity.startAt).getTime();
    const end = new Date(activity.endAt).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    validCount += 1;
    const duration = (end - start) / 60_000;
    byCategory.set(activity.category, (byCategory.get(activity.category) ?? 0) + duration);
    const startOfActivityDay = new Date(start);
    startOfActivityDay.setHours(0, 0, 0, 0);
    let cursor = startOfActivityDay;
    while (cursor.getTime() < end) {
      const nextDay = new Date(cursor);
      nextDay.setDate(nextDay.getDate() + 1);
      const sliceMinutes = overlapMinutes(activity, cursor.getTime(), nextDay.getTime());
      const key = getDateKey(cursor);
      byDate.set(key, (byDate.get(key) ?? 0) + sliceMinutes);
      cursor = nextDay;
    }
    const todayOverlap = overlapMinutes(activity, todayStart, dayEnd);
    if (todayOverlap > 0) {
      todayMinutes += todayOverlap;
      todayCount += 1;
    }
  }

  const categoryMinutes = [...byCategory.entries()]
    .map(([category, minutes]) => ({ category, minutes: Math.round(minutes) }))
    .sort((a, b) => b.minutes - a.minutes);
  const dailyMinutes = [...byDate.entries()]
    .map(([dateKey, minutes]) => ({ dateKey, minutes: Math.round(minutes) }))
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  return {
    todayMinutes: Math.round(todayMinutes),
    totalMinutes: Math.round([...byCategory.values()].reduce((total, minutes) => total + minutes, 0)),
    todayCount,
    totalCount: validCount,
    mostUsedCategory: categoryMinutes[0]?.category ?? null,
    categoryMinutes,
    dailyMinutes,
  };
}

export function makeActivity(draft: ActivityDraft, id: string, now = new Date()): Activity {
  const errors = validateActivity(draft);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const timestamp = formatToISOWithOffset(now);
  return {
    id,
    title: draft.title.trim(),
    category: draft.category.trim(),
    startAt: new Date(draft.startAt).toISOString(),
    endAt: new Date(draft.endAt).toISOString(),
    notes: draft.notes?.trim() ?? '',
    tags: (draft.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
