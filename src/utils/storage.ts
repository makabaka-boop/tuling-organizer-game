import type { GameProgress, ScoreRecord, ReviewSummary } from './types';
import { STORAGE_KEYS } from './types';

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    console.warn('Failed to save to localStorage');
  }
}

export function getGameProgress(key: typeof STORAGE_KEYS.PROGRESS): GameProgress {
  const data = safeGetItem(key);
  if (!data) {
    return {
      unlockedLevels: [1],
      highScores: {},
      completedLevels: [],
      lastReviewTags: {},
    };
  }
  try {
    const parsed = JSON.parse(data);
    return {
      unlockedLevels: [1],
      highScores: {},
      completedLevels: [],
      lastReviewTags: {},
      ...parsed,
    };
  } catch {
    return {
      unlockedLevels: [1],
      highScores: {},
      completedLevels: [],
      lastReviewTags: {},
    };
  }
}

export function saveGameProgress(
  key: typeof STORAGE_KEYS.PROGRESS,
  progress: GameProgress
): void {
  safeSetItem(key, JSON.stringify(progress));
}

export function getScoreRecords(key: typeof STORAGE_KEYS.SCORES): ScoreRecord[] {
  const data = safeGetItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveScoreRecord(
  key: typeof STORAGE_KEYS.SCORES,
  record: ScoreRecord
): void {
  const records = getScoreRecords(key);
  records.unshift(record);
  const recentRecords = records.slice(0, 50);
  safeSetItem(key, JSON.stringify(recentRecords));
}

export function updateProgressAfterGame(
  progressKey: typeof STORAGE_KEYS.PROGRESS,
  scoresKey: typeof STORAGE_KEYS.SCORES,
  levelId: number,
  levelName: string,
  score: number,
  scoreResult: ScoreRecord['score'],
  reviewSummary?: ReviewSummary
): GameProgress {
  const progress = getGameProgress(progressKey);

  if (!progress.completedLevels.includes(levelId)) {
    progress.completedLevels.push(levelId);
  }

  if (!progress.highScores[levelId] || score > progress.highScores[levelId]) {
    progress.highScores[levelId] = score;
  }

  if (reviewSummary) {
    progress.lastReviewTags[levelId] = reviewSummary.tags;
  }

  const nextLevel = levelId + 1;
  if (nextLevel <= 4 && !progress.unlockedLevels.includes(nextLevel)) {
    progress.unlockedLevels.push(nextLevel);
  }

  saveGameProgress(progressKey, progress);

  saveScoreRecord(scoresKey, {
    levelId,
    levelName,
    score: scoreResult,
    date: new Date().toISOString(),
    reviewSummary,
  });

  return progress;
}

export { STORAGE_KEYS };
