/**
 * Core log types for Logger application.
 * Follows the Universal Log Schema.
 */

export type LogType = 'text' | 'voice' | 'mood';

export interface TextLogContent {
  text: string;
}

export interface VoiceLogContent {
  text: string;
  durationSeconds?: number;
  language?: string;
}

export interface MoodLogContent {
  score: number; // 1 to 10
  label: string; // e.g. "Happy", "Neutral", "Low"
  reason: string; // Mandatory explanation
}

export type LogContent = TextLogContent | VoiceLogContent | MoodLogContent;

export interface LogEntry<T extends LogContent = LogContent> {
  id: string; // UUID
  timestamp: string; // ISO-8601 string
  type: LogType;
  content: T;
  createdAt: string; // ISO-8601 string
  updatedAt: string; // ISO-8601 string
}

export type TextLogEntry = LogEntry<TextLogContent> & { type: 'text' };
export type VoiceLogEntry = LogEntry<VoiceLogContent> & { type: 'voice' };
export type MoodLogEntry = LogEntry<MoodLogContent> & { type: 'mood' };

export interface LogFilterOptions {
  type?: LogType | 'all';
  searchQuery?: string;
  startDate?: string; // ISO date string YYYY-MM-DD
  endDate?: string;   // ISO date string YYYY-MM-DD
}

export type ExportRangeType = 'today' | 'last7days' | 'last30days' | 'custom';

export interface ExportData {
  exportVersion: string;
  exportedAt: string;
  range: {
    start: string;
    end: string;
  };
  totalLogs: number;
  logs: {
    id: string;
    timestamp: string;
    type: LogType;
    content: LogContent;
    createdAt?: string;
    updatedAt?: string;
  }[];
}
