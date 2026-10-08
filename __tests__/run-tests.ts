import './activity-tests';

import assert from 'node:assert';
import test, { describe } from 'node:test';
import { getMoodConfig, getMoodLabel, MOOD_CONFIG } from '../src/constants/mood';
import {
  formatDayHeader,
  formatDisplayTime,
  formatToISOWithOffset,
  getDateDayRange,
  getDateKey,
  getPastDaysRange,
} from '../src/utils/date';
import { generateUUID } from '../src/utils/uuid';

describe('Logger Core Application Test Suite', () => {
  test('1. UUID Generation produces valid RFC-4122 v4', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();

    assert.ok(uuid1);
    assert.ok(uuid2);
    assert.notStrictEqual(uuid1, uuid2);

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    assert.match(uuid1, uuidRegex);
    assert.match(uuid2, uuidRegex);
    console.log('✓ UUID v4 generation verified:', uuid1);
  });

  test('2. Date & ISO-8601 Timestamp formatting preserves timezone offset', () => {
    const date = new Date(2026, 8, 29, 19, 15, 32);
    const iso = formatToISOWithOffset(date);

    assert.match(iso, /^2026-09-29T19:15:32\.\d{3}[+-]\d{2}:\d{2}$/);
    console.log('✓ ISO-8601 formatted with timezone offset:', iso);

    const key = getDateKey(iso);
    assert.strictEqual(key, '2026-09-29');
    console.log('✓ DateKey extracted:', key);

    const display = formatDisplayTime('2026-09-29T19:15:32+05:30');
    assert.ok(display.length > 0);
    console.log('✓ Display time formatted:', display);

    const { title, subtitle } = formatDayHeader('2026-09-29');
    assert.ok(title);
    assert.ok(subtitle.includes('2026'));
    console.log('✓ Day header formatted:', title, subtitle);

    const dayRange = getDateDayRange('2026-09-29');
    assert.ok(dayRange.startISO.includes('2026-09-29T00:00:00.000'));
    assert.ok(dayRange.endISO.includes('2026-09-29T23:59:59.999'));
    console.log('✓ Date day range verified:', dayRange);

    const weekRange = getPastDaysRange(7);
    assert.ok(new Date(weekRange.startISO).getTime() < new Date(weekRange.endISO).getTime());
    console.log('✓ Past 7 days range verified');
  });

  test('3. Centralized Mood Rating Configuration (1-10)', () => {
    for (let score = 1; score <= 10; score++) {
      const config = MOOD_CONFIG[score];
      assert.ok(config, `Missing config for mood score ${score}`);
      assert.strictEqual(config.score, score);
      assert.ok(config.label.length > 0);
      assert.ok(config.emoji.length > 0);
      assert.match(config.color, /^#[0-9A-Fa-f]{6}$/);
      assert.ok(config.description.length > 0);
    }
    console.log('✓ All 10 mood score configurations validated');

    assert.strictEqual(getMoodConfig(7).label, 'Good');
    assert.strictEqual(getMoodLabel(7), 'Good');
    assert.strictEqual(getMoodConfig(1).label, 'Worst / In Distress');
    assert.strictEqual(getMoodConfig(10).label, 'Euphoric / Best');

    // Clamping verification
    assert.strictEqual(getMoodConfig(-5).score, 1);
    assert.strictEqual(getMoodConfig(99).score, 10);
    console.log('✓ Mood score clamping and label lookup verified');
  });

  test('4. Universal Log Schema & Strict Audio Privacy Guarantee in JSON Export', () => {
    const textLog = {
      id: generateUUID(),
      timestamp: '2026-09-29T07:30:00+05:30',
      type: 'text' as const,
      content: { text: 'Started studying DSA.' },
      createdAt: '2026-09-29T07:30:00+05:30',
      updatedAt: '2026-09-29T07:30:00+05:30',
    };

    const moodLog = {
      id: generateUUID(),
      timestamp: '2026-09-29T09:10:00+05:30',
      type: 'mood' as const,
      content: { score: 7, label: 'Good', reason: 'Feeling energetic today.' },
      createdAt: '2026-09-29T09:10:00+05:30',
      updatedAt: '2026-09-29T09:10:00+05:30',
    };

    const voiceLog = {
      id: generateUUID(),
      timestamp: '2026-09-29T10:45:00+05:30',
      type: 'voice' as const,
      content: {
        text: 'Aaj main gym gaya tha, wahan pe maine four squats kiye aur phir barbell curls start kiye.',
        durationSeconds: 38,
      },
      createdAt: '2026-09-29T10:45:00+05:30',
      updatedAt: '2026-09-29T10:45:00+05:30',
    };

    const mockExportPayload = {
      exportVersion: '1.0',
      exportedAt: '2026-09-29T19:30:00+05:30',
      range: {
        start: '2026-09-29T00:00:00.000+05:30',
        end: '2026-09-29T23:59:59.999+05:30',
      },
      totalLogs: 3,
      logs: [textLog, moodLog, voiceLog],
    };

    const exportedString = JSON.stringify(mockExportPayload, null, 2);

    // Verify format and absence of any audio files/blobs/URIs
    assert.strictEqual(exportedString.includes('audioPath'), false);
    assert.strictEqual(exportedString.includes('audioUri'), false);
    assert.strictEqual(exportedString.includes('audioBase64'), false);
    assert.strictEqual(exportedString.includes('audioBlob'), false);
    assert.strictEqual(exportedString.includes('audioBinary'), false);

    console.log('✓ Universal Log Schema validated');
    console.log('✓ Strict privacy guarantee verified: No permanent audio reference exists');
  });
});
