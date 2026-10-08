import { getDatabase } from '../../database';
import { generateUUID } from '../../utils/uuid';
import { ActivityService, type ActivityStore } from './ActivityService';
import type { Activity, ActivityDraft } from './activityTypes';

interface ActivityRow {
  id: string;
  title: string;
  category: string;
  startAt: string;
  endAt: string;
  notes: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

function fromRow(row: ActivityRow): Activity {
  let tags: string[] = [];
  try {
    const parsed: unknown = JSON.parse(row.tags);
    if (Array.isArray(parsed)) tags = parsed.filter((tag): tag is string => typeof tag === 'string');
  } catch {
    tags = [];
  }
  return { ...row, tags };
}

export class ActivityRepository {
  static async initialize(): Promise<void> {
    const db = await getDatabase();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        startAt TEXT NOT NULL,
        endAt TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        tags TEXT NOT NULL DEFAULT '[]',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_activities_start_at ON activities(startAt DESC);
    `);
  }

  static async list(): Promise<Activity[]> {
    await this.initialize();
    const db = await getDatabase();
    const rows = await db.getAllAsync<ActivityRow>(
      'SELECT id, title, category, startAt, endAt, notes, tags, createdAt, updatedAt FROM activities ORDER BY startAt DESC;'
    );
    return rows.map(fromRow);
  }

  static async get(id: string): Promise<Activity | null> {
    await this.initialize();
    const db = await getDatabase();
    const row = await db.getFirstAsync<ActivityRow>(
      'SELECT id, title, category, startAt, endAt, notes, tags, createdAt, updatedAt FROM activities WHERE id = ?;',
      [id]
    );
    return row ? fromRow(row) : null;
  }

  static create(draft: ActivityDraft): Promise<Activity> {
    return activityService.create(draft);
  }

  static async update(id: string, draft: ActivityDraft): Promise<Activity | null> {
    const current = await this.get(id);
    return current ? activityService.update(id, draft, current) : null;
  }

  static async persist(activity: Activity): Promise<void> {
    await this.initialize();
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO activities (id, title, category, startAt, endAt, notes, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title=excluded.title, category=excluded.category,
       startAt=excluded.startAt, endAt=excluded.endAt, notes=excluded.notes,
       tags=excluded.tags, updatedAt=excluded.updatedAt;`,
      [activity.id, activity.title, activity.category, activity.startAt, activity.endAt,
        activity.notes, JSON.stringify(activity.tags), activity.createdAt, activity.updatedAt]
    );
  }

  static async updateStored(activity: Activity): Promise<boolean> {
    await this.initialize();
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE activities SET title = ?, category = ?, startAt = ?, endAt = ?, notes = ?, tags = ?, updatedAt = ? WHERE id = ?;`,
      [activity.title, activity.category, activity.startAt, activity.endAt,
        activity.notes, JSON.stringify(activity.tags), activity.updatedAt, activity.id]
    );
    return result.changes > 0;
  }

  static async deleteStored(id: string): Promise<boolean> {
    await this.initialize();
    const db = await getDatabase();
    const result = await db.runAsync('DELETE FROM activities WHERE id = ?;', [id]);
    return result.changes > 0;
  }

  static delete(id: string): Promise<boolean> {
    return activityService.delete(id);
  }
}

const sqliteActivityStore: ActivityStore = {
  create: (activity) => ActivityRepository.persist(activity),
  update: (activity) => ActivityRepository.updateStored(activity),
  delete: (id) => ActivityRepository.deleteStored(id),
};

const activityService = new ActivityService(sqliteActivityStore, generateUUID);
