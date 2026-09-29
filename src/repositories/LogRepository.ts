import { getDatabase } from '../database';
import { LogContent, LogEntry, LogType } from '../types/log';
import { getCurrentISOTimestamp } from '../utils/date';
import { generateUUID } from '../utils/uuid';

interface LogRow {
  id: string;
  timestamp: string;
  type: LogType;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function rowToEntry(row: LogRow): LogEntry {
  let parsedContent: LogContent;
  try {
    parsedContent = JSON.parse(row.content);
  } catch (err) {
    console.error(`[LogRepository] Failed to parse content for log id ${row.id}:`, err);
    parsedContent = { text: '' };
  }

  return {
    id: row.id,
    timestamp: row.timestamp,
    type: row.type,
    content: parsedContent,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class LogRepository {
  /**
   * Creates a new log entry.
   * Timestamp defaults to current ISO string if not provided.
   */
  static async createLog<T extends LogContent>(
    type: LogType,
    content: T,
    timestamp?: string
  ): Promise<LogEntry<T>> {
    const db = await getDatabase();
    const id = generateUUID();
    const now = getCurrentISOTimestamp();
    const finalTimestamp = timestamp || now;
    const contentJson = JSON.stringify(content);

    await db.runAsync(
      `INSERT INTO logs (id, timestamp, type, content, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [id, finalTimestamp, type, contentJson, now, now]
    );

    return {
      id,
      timestamp: finalTimestamp,
      type,
      content,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Retrieves a log entry by its unique ID.
   */
  static async getLogById(id: string): Promise<LogEntry | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<LogRow>(
      `SELECT id, timestamp, type, content, createdAt, updatedAt FROM logs WHERE id = ?;`,
      [id]
    );

    return row ? rowToEntry(row) : null;
  }

  /**
   * Retrieves all logs with optional filtering and pagination.
   * Default ordering: newest first (timestamp DESC).
   */
  static async getLogs(options?: {
    type?: LogType | 'all';
    limit?: number;
    offset?: number;
  }): Promise<LogEntry[]> {
    const db = await getDatabase();
    let query = `SELECT id, timestamp, type, content, createdAt, updatedAt FROM logs`;
    const params: (string | number)[] = [];

    if (options?.type && options.type !== 'all') {
      query += ` WHERE type = ?`;
      params.push(options.type);
    }

    query += ` ORDER BY timestamp DESC`;

    if (options?.limit) {
      query += ` LIMIT ?`;
      params.push(options.limit);
      if (options?.offset) {
        query += ` OFFSET ?`;
        params.push(options.offset);
      }
    }

    const rows = await db.getAllAsync<LogRow>(query, params);
    return rows.map(rowToEntry);
  }

  /**
   * Retrieves all logs for a specific calendar date (YYYY-MM-DD).
   */
  static async getLogsByDate(
    dateKey: string, // YYYY-MM-DD
    typeFilter?: LogType | 'all'
  ): Promise<LogEntry[]> {
    const db = await getDatabase();
    // Match timestamps starting with dateKey (e.g. 2026-09-29T...)
    let query = `SELECT id, timestamp, type, content, createdAt, updatedAt FROM logs WHERE timestamp LIKE ?`;
    const params: string[] = [`${dateKey}%`];

    if (typeFilter && typeFilter !== 'all') {
      query += ` AND type = ?`;
      params.push(typeFilter);
    }

    query += ` ORDER BY timestamp DESC`;

    const rows = await db.getAllAsync<LogRow>(query, params);
    return rows.map(rowToEntry);
  }

  /**
   * Retrieves logs within an ISO date-time range.
   */
  static async getLogsByDateRange(
    startISO: string,
    endISO: string,
    typeFilter?: LogType | 'all'
  ): Promise<LogEntry[]> {
    const db = await getDatabase();
    let query = `SELECT id, timestamp, type, content, createdAt, updatedAt
                 FROM logs
                 WHERE timestamp >= ? AND timestamp <= ?`;
    const params: string[] = [startISO, endISO];

    if (typeFilter && typeFilter !== 'all') {
      query += ` AND type = ?`;
      params.push(typeFilter);
    }

    query += ` ORDER BY timestamp DESC`;

    const rows = await db.getAllAsync<LogRow>(query, params);
    return rows.map(rowToEntry);
  }

  /**
   * Updates an existing log entry.
   */
  static async updateLog(
    id: string,
    content: LogContent,
    timestamp?: string
  ): Promise<LogEntry | null> {
    const db = await getDatabase();
    const existing = await this.getLogById(id);
    if (!existing) {
      return null;
    }

    const now = getCurrentISOTimestamp();
    const finalTimestamp = timestamp || existing.timestamp;
    const contentJson = JSON.stringify(content);

    await db.runAsync(
      `UPDATE logs SET content = ?, timestamp = ?, updatedAt = ? WHERE id = ?;`,
      [contentJson, finalTimestamp, now, id]
    );

    return {
      ...existing,
      timestamp: finalTimestamp,
      content,
      updatedAt: now,
    };
  }

  /**
   * Deletes a log entry by its ID.
   */
  static async deleteLog(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.runAsync(`DELETE FROM logs WHERE id = ?;`, [id]);
    return result.changes > 0;
  }

  /**
   * Performs an offline search across text content, voice transcripts, and mood reasons.
   */
  static async searchLogs(
    query: string,
    options?: { type?: LogType | 'all'; limit?: number }
  ): Promise<LogEntry[]> {
    if (!query.trim()) {
      return this.getLogs(options);
    }

    const db = await getDatabase();
    const searchTerm = `%${query.trim()}%`;
    let sql = `SELECT id, timestamp, type, content, createdAt, updatedAt
               FROM logs
               WHERE content LIKE ?`;
    const params: (string | number)[] = [searchTerm];

    if (options?.type && options.type !== 'all') {
      sql += ` AND type = ?`;
      params.push(options.type);
    }

    sql += ` ORDER BY timestamp DESC`;

    if (options?.limit) {
      sql += ` LIMIT ?`;
      params.push(options.limit);
    }

    const rows = await db.getAllAsync<LogRow>(sql, params);
    return rows.map(rowToEntry);
  }

  /**
   * Returns distinct dates (YYYY-MM-DD) that have logs, for calendar/date navigation.
   */
  static async getDistinctDates(): Promise<string[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ dateKey: string }>(
      `SELECT DISTINCT substr(timestamp, 1, 10) as dateKey FROM logs ORDER BY dateKey DESC;`
    );
    return rows.map((r) => r.dateKey);
  }

  /**
   * Counts total logs in the database.
   */
  static async getCount(): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT count(*) as count FROM logs;`
    );
    return row?.count ?? 0;
  }
}
