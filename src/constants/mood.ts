/**
 * Centralized Mood Rating Configuration (1 - 10)
 * All labels and color tokens are centralized here for easy maintenance.
 */

export interface MoodConfigItem {
  score: number;
  label: string;
  shortLabel: string;
  emoji: string;
  color: string; // Theme accent color for this mood score
  description: string;
}

export const MOOD_CONFIG: Record<number, MoodConfigItem> = {
  1: {
    score: 1,
    label: 'Worst / In Distress',
    shortLabel: 'Worst',
    emoji: '💔',
    color: '#E53E3E',
    description: 'Extremely overwhelmed or distressed',
  },
  2: {
    score: 2,
    label: 'Very Bad',
    shortLabel: 'Very Bad',
    emoji: '😞',
    color: '#ED8936',
    description: 'Feeling very down or exhausted',
  },
  3: {
    score: 3,
    label: 'Low',
    shortLabel: 'Low',
    emoji: '🙁',
    color: '#DD6B20',
    description: 'Low energy, sad, or unmotivated',
  },
  4: {
    score: 4,
    label: 'Slightly Low',
    shortLabel: 'Slightly Low',
    emoji: '😐',
    color: '#D69E2E',
    description: 'Not great, feeling somewhat off',
  },
  5: {
    score: 5,
    label: 'Neutral / Okay',
    shortLabel: 'Neutral',
    emoji: '😐',
    color: '#718096',
    description: 'Balanced, steady, neither good nor bad',
  },
  6: {
    score: 6,
    label: 'Pleasant',
    shortLabel: 'Pleasant',
    emoji: '🙂',
    color: '#38B2AC',
    description: 'Fairly good, calm and relaxed',
  },
  7: {
    score: 7,
    label: 'Good',
    shortLabel: 'Good',
    emoji: '😊',
    color: '#319795',
    description: 'Feeling positive and content',
  },
  8: {
    score: 8,
    label: 'Happy',
    shortLabel: 'Happy',
    emoji: '😄',
    color: '#38A169',
    description: 'Energetic, productive, cheerful',
  },
  9: {
    score: 9,
    label: 'Very Happy',
    shortLabel: 'Very Happy',
    emoji: '😁',
    color: '#2F855A',
    description: 'Great mood, excited and fulfilled',
  },
  10: {
    score: 10,
    label: 'Euphoric / Best',
    shortLabel: 'Best',
    emoji: '🤩',
    color: '#276749',
    description: 'At peak joy, inspired, thriving',
  },
};

export const DEFAULT_MOOD_SCORE = 7;

export function getMoodConfig(score: number): MoodConfigItem {
  const rounded = Math.min(10, Math.max(1, Math.round(score)));
  return MOOD_CONFIG[rounded] || MOOD_CONFIG[5];
}

export function getMoodLabel(score: number): string {
  return getMoodConfig(score).label;
}
