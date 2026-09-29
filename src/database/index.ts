import * as SQLite from 'expo-sqlite';
import {
  CREATE_LOGS_DATE_INDEX,
  CREATE_LOGS_TABLE,
  CREATE_LOGS_TIMESTAMP_INDEX,
  CREATE_LOGS_TYPE_INDEX,
} from './schema';

const DB_NAME = 'logger.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);

      // Enable WAL mode for high performance offline SQLite operations
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync('PRAGMA foreign_keys = ON;');

      // Create tables and indexes
      await db.execAsync(CREATE_LOGS_TABLE);
      await db.execAsync(CREATE_LOGS_TIMESTAMP_INDEX);
      await db.execAsync(CREATE_LOGS_TYPE_INDEX);
      await db.execAsync(CREATE_LOGS_DATE_INDEX);

      dbInstance = db;
      return db;
    } catch (error) {
      initPromise = null;
      console.error('[Database] Failed to initialize SQLite database:', error);
      throw error;
    }
  })();

  return initPromise;
}
