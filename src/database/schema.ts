/**
 * Database Schema and Migrations for Logger
 */

export const SCHEMA_VERSION = 1;

export const CREATE_LOGS_TABLE = `
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY NOT NULL,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('text', 'voice', 'mood')),
  content TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
`;

export const CREATE_LOGS_TIMESTAMP_INDEX = `
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
`;

export const CREATE_LOGS_TYPE_INDEX = `
CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type);
`;

export const CREATE_LOGS_DATE_INDEX = `
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(createdAt DESC);
`;
