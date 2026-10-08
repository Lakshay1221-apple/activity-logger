import type { Activity, ActivityDraft } from './activityTypes';
import { makeActivity } from './activityUtils';

export interface ActivityStore {
  create(activity: Activity): Promise<void>;
  update(activity: Activity): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export class ActivityService {
  constructor(private readonly store: ActivityStore, private readonly newId: () => string) {}

  async create(draft: ActivityDraft, now = new Date()): Promise<Activity> {
    const activity = makeActivity(draft, this.newId(), now);
    await this.store.create(activity);
    return activity;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  async update(id: string, draft: ActivityDraft, current: Activity, now = new Date()): Promise<Activity | null> {
    if (current.id !== id) return null;
    const updated = { ...makeActivity(draft, id, now), createdAt: current.createdAt };
    return (await this.store.update(updated)) ? updated : null;
  }
}
