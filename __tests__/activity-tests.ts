import assert from 'node:assert/strict';
import test from 'node:test';
import { ActivityService } from '../src/features/activities/ActivityService';
import { activitiesOverlappingDate, calculateCategoryTotals, calculateDurationMinutes, calculateStatistics, groupActivitiesByDate, validateActivity } from '../src/features/activities/activityUtils';
import type { Activity } from '../src/features/activities/activityTypes';

const sample = (overrides: Partial<Activity> = {}): Activity => ({
  id: '1',
  title: 'Deep work',
  category: 'Work',
  startAt: new Date(2026, 9, 7, 23, 30).toISOString(),
  endAt: new Date(2026, 9, 8, 1, 0).toISOString(),
  notes: '',
  tags: [],
  createdAt: '2026-10-07T23:30:00.000Z',
  updatedAt: '2026-10-07T23:30:00.000Z',
  ...overrides,
});

test('duration handles activities that cross midnight', () => {
  assert.equal(calculateDurationMinutes(sample()), 90);
});

test('validation requires title and category and rejects reversed time ranges', () => {
  assert.deepEqual(validateActivity({ title: ' ', category: 'Work', startAt: '2026-10-08T10:00:00Z', endAt: '2026-10-08T11:00:00Z' }), { title: 'Enter an activity name.' });
  assert.deepEqual(validateActivity({ title: 'Read', category: '', startAt: '2026-10-08T10:00:00Z', endAt: '2026-10-08T11:00:00Z' }), { category: 'Choose a category.' });
  assert.deepEqual(validateActivity({ title: 'Read', category: 'Study', startAt: '2026-10-08T11:00:00Z', endAt: '2026-10-08T10:00:00Z' }), { endAt: 'End time must be after the start time.' });
});

test('groups by local calendar date in reverse chronological order', () => {
  const groups = groupActivitiesByDate([sample(), sample({ id: '2', startAt: '2026-10-06T12:00:00Z' })]);
  assert.deepEqual(groups.map((group) => group.dateKey), ['2026-10-07', '2026-10-06']);
});

test('includes an overnight activity in each day it overlaps', () => {
  const overnight = sample();
  assert.deepEqual(activitiesOverlappingDate([overnight], '2026-10-07').map((item) => item.id), ['1']);
  assert.deepEqual(activitiesOverlappingDate([overnight], '2026-10-08').map((item) => item.id), ['1']);
  assert.deepEqual(activitiesOverlappingDate([overnight], '2026-10-09'), []);
  assert.deepEqual(calculateCategoryTotals([overnight], '2026-10-07'), [{ category: 'Work', minutes: 30 }]);
  assert.deepEqual(calculateCategoryTotals([overnight], '2026-10-08'), [{ category: 'Work', minutes: 60 }]);
});

test('statistics summarize totals and category distribution', () => {
  const stats = calculateStatistics([sample(), sample({ id: '2', category: 'Study', startAt: new Date(2026, 9, 6, 10).toISOString(), endAt: new Date(2026, 9, 6, 10, 30).toISOString() })], '2026-10-08');
  assert.equal(stats.todayMinutes, 60);
  assert.equal(stats.todayCount, 1);
  assert.equal(stats.totalMinutes, 120);
  assert.equal(stats.totalCount, 2);
  assert.equal(stats.mostUsedCategory, 'Work');
  assert.deepEqual(stats.dailyMinutes.slice(-3).map((item) => item.minutes), [30, 30, 60]);
  assert.equal(stats.dailyMinutes.length, 7);
  assert.equal(stats.dailyMinutes.at(-2)?.minutes, 30);
  assert.deepEqual(calculateCategoryTotals([sample()], '2026-10-08'), [{ category: 'Work', minutes: 60 }]);
});

test('activity service creates normalized records and removes by ID', async () => {
  const records = new Map<string, Activity>();
  const service = new ActivityService({
    async create(activity) { records.set(activity.id, activity); },
    async update(activity) { records.set(activity.id, activity); return true; },
    async delete(id) { return records.delete(id); },
  }, () => 'activity-id');
  const created = await service.create({ title: '  Focus  ', category: 'Work', startAt: '2026-10-08T09:00:00Z', endAt: '2026-10-08T10:00:00Z', tags: [' deep work ', ''] }, new Date('2026-10-08T10:00:00Z'));
  assert.equal(created.title, 'Focus');
  assert.deepEqual(created.tags, ['deep work']);
  assert.equal(records.get('activity-id')?.title, 'Focus');
  assert.equal(await service.delete('activity-id'), true);
  assert.equal(records.has('activity-id'), false);
});
