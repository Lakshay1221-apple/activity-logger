export const ACTIVITY_CATEGORIES = [
  'Work',
  'Study',
  'Exercise',
  'Reading',
  'Meeting',
  'Personal',
  'Entertainment',
  'Other',
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number] | (string & {});

export interface Activity {
  id: string;
  title: string;
  category: ActivityCategory;
  startAt: string;
  endAt: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityDraft {
  title: string;
  category: string;
  startAt: string;
  endAt: string;
  notes?: string;
  tags?: string[];
}

export interface ActivityDateGroup {
  dateKey: string;
  activities: Activity[];
}

export interface ActivityStatistics {
  todayMinutes: number;
  totalMinutes: number;
  todayCount: number;
  totalCount: number;
  mostUsedCategory: string | null;
  categoryMinutes: { category: string; minutes: number }[];
  dailyMinutes: { dateKey: string; minutes: number }[];
}
