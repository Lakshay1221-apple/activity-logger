import { useCallback, useEffect, useState } from 'react';
import { LogRepository } from '../repositories/LogRepository';
import { LogContent, LogEntry, LogType } from '../types/log';
import { getDateKey } from '../utils/date';

export function useLogs() {
  const todayKey = getDateKey(new Date());

  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [typeFilter, setTypeFilter] = useState<LogType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [distinctDates, setDistinctDates] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const fetchLogs = useCallback(async () => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        let results: LogEntry[];

        if (searchQuery.trim().length > 0) {
          results = await LogRepository.searchLogs(searchQuery, {
            type: typeFilter !== 'all' ? typeFilter : undefined,
          });
        } else {
          results = await LogRepository.getLogsByDate(
            selectedDate,
            typeFilter !== 'all' ? typeFilter : undefined
          );
        }

        const [dates, count] = await Promise.all([
          LogRepository.getDistinctDates(),
          LogRepository.getCount(),
        ]);

        if (!cancelled) {
          setLogs(results);
          setDistinctDates(dates);
          setTotalCount(count);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[useLogs] Error loading logs:', err);
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [selectedDate, typeFilter, searchQuery, refreshTrigger]);

  const createLog = async <T extends LogContent>(
    type: LogType,
    content: T,
    timestamp?: string
  ): Promise<LogEntry<T>> => {
    const newEntry = await LogRepository.createLog(type, content, timestamp);
    await fetchLogs();
    return newEntry;
  };

  const updateLog = async (
    id: string,
    content: LogContent,
    timestamp?: string
  ): Promise<LogEntry | null> => {
    const updated = await LogRepository.updateLog(id, content, timestamp);
    await fetchLogs();
    return updated;
  };

  const deleteLog = async (id: string): Promise<boolean> => {
    const success = await LogRepository.deleteLog(id);
    if (success) {
      await fetchLogs();
    }
    return success;
  };

  const goToPreviousDay = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const prev = new Date(year, month - 1, day - 1);
    setSelectedDate(getDateKey(prev));
  };

  const goToNextDay = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const next = new Date(year, month - 1, day + 1);
    setSelectedDate(getDateKey(next));
  };

  const goToToday = () => {
    setSelectedDate(todayKey);
  };

  return {
    logs,
    isLoading,
    selectedDate,
    setSelectedDate,
    isToday: selectedDate === todayKey,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    distinctDates,
    totalCount,
    refreshLogs: fetchLogs,
    createLog,
    updateLog,
    deleteLog,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  };
}
