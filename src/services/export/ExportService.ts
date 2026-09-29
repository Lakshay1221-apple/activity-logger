import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { LogRepository } from '../../repositories/LogRepository';
import { ExportData, ExportRangeType, LogEntry } from '../../types/log';
import {
  getCurrentISOTimestamp,
  getDateDayRange,
  getDateKey,
  getPastDaysRange,
} from '../../utils/date';

export interface ExportOptions {
  rangeType: ExportRangeType;
  customStartDate?: string; // YYYY-MM-DD
  customEndDate?: string;   // YYYY-MM-DD
}

export class ExportService {
  /**
   * Resolves the ISO start and end timestamps based on range type.
   */
  static resolveRange(options: ExportOptions): { startISO: string; endISO: string } {
    const todayKey = getDateKey(new Date());

    switch (options.rangeType) {
      case 'today':
        return getDateDayRange(todayKey);

      case 'last7days':
        return getPastDaysRange(7);

      case 'last30days':
        return getPastDaysRange(30);

      case 'custom': {
        const startKey = options.customStartDate || todayKey;
        const endKey = options.customEndDate || todayKey;

        const { startISO } = getDateDayRange(startKey);
        const { endISO } = getDateDayRange(endKey);

        return { startISO, endISO };
      }

      default:
        return getDateDayRange(todayKey);
    }
  }

  /**
   * Generates sanitized export data object.
   * STRICT GUARANTEE: Never includes audio paths or audio binaries!
   */
  static async generateExportData(options: ExportOptions): Promise<ExportData> {
    const { startISO, endISO } = this.resolveRange(options);
    const logs = await LogRepository.getLogsByDateRange(startISO, endISO);

    // Sanitize logs to ensure absolutely NO audio references exist
    const sanitizedLogs = logs.map((log: LogEntry) => {
      const sanitizedContent: any = { ...log.content };
      delete sanitizedContent.audioPath;
      delete sanitizedContent.audioUri;
      delete sanitizedContent.audioBase64;
      delete sanitizedContent.audioBlob;

      return {
        id: log.id,
        timestamp: log.timestamp,
        type: log.type,
        content: sanitizedContent,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
      };
    });

    const exportPayload: ExportData = {
      exportVersion: '1.0',
      exportedAt: getCurrentISOTimestamp(),
      range: {
        start: startISO,
        end: endISO,
      },
      totalLogs: sanitizedLogs.length,
      logs: sanitizedLogs,
    };

    return exportPayload;
  }

  /**
   * Creates a local JSON file and triggers native sharing.
   */
  static async exportAndShare(options: ExportOptions): Promise<{
    fileUri: string;
    totalLogs: number;
  }> {
    const exportData = await this.generateExportData(options);

    const timestampSlug = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `logger_export_${options.rangeType}_${timestampSlug}.json`;

    const file = new File(Paths.cache, fileName);
    const jsonString = JSON.stringify(exportData, null, 2);
    await file.write(jsonString);

    const fileUri = file.uri;
    console.log(`[ExportService] Successfully created export file at ${fileUri}`);

    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Logger Data (Offline JSON)',
        UTI: 'public.json',
      });
    } else {
      console.warn('[ExportService] Sharing is not available on this device');
    }

    return {
      fileUri,
      totalLogs: exportData.totalLogs,
    };
  }
}
