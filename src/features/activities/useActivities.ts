import { useCallback, useEffect, useState } from 'react';
import type { Activity, ActivityDraft } from './activityTypes';
import { ActivityRepository } from './ActivityRepository';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setActivities(await ActivityRepository.list());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load activities.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    ActivityRepository.list().then((items) => {
      if (active) {
        setActivities(items);
        setError(null);
      }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Could not load activities.');
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const create = useCallback(async (draft: ActivityDraft) => {
    const activity = await ActivityRepository.create(draft);
    await refresh();
    return activity;
  }, [refresh]);

  const update = useCallback(async (id: string, draft: ActivityDraft) => {
    const activity = await ActivityRepository.update(id, draft);
    await refresh();
    return activity;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    const deleted = await ActivityRepository.delete(id);
    await refresh();
    return deleted;
  }, [refresh]);

  return { activities, isLoading, error, refresh, create, update, remove };
}
