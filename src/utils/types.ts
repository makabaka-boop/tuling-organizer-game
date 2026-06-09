export type BellStatus = 'pending' | 'queued' | 'returned' | 'isolated';

export type EventType = 'shuffle' | 'missing' | 'disable' | 'delay';

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface Bell {
  id: string;
  name: string;
  code: string;
  category: string;
  status: BellStatus;
  isAbnormal: boolean;
  abnormalReason?: string;
  disabled: boolean;
  correctPosition: number;
  needReturn: boolean;
}

export interface GameEvent {
  id: string;
  type: EventType;
  triggerTime: number;
  duration?: number;
  targetBellIds?: string[];
  message: string;
  resolved?: boolean;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4;
  totalTime: number;
  bells: Bell[];
  events: GameEvent[];
  targetReturnCount: number;
}

export interface ReviewSummary {
  weaknesses: string[];
  keyReasons: string[];
  suggestions: string[];
  tags: string[];
}

export interface ScoreResult {
  orderAccuracy: number;
  returnCompleteness: number;
  isolationTimeliness: number;
  timeEfficiency: number;
  totalScore: number;
  grade: Grade;
  timeUsed: number;
}

export interface IsolationRecord {
  bellId: string;
  time: number;
}

export interface GameState {
  currentLevel: Level | null;
  bells: Bell[];
  queue: string[];
  selectedBells: string[];
  timeRemaining: number;
  totalTime: number;
  isPaused: boolean;
  isRunning: boolean;
  activeEvent: GameEvent | null;
  isolationRecords: IsolationRecord[];
  abnormalAppearTimes: Record<string, number>;
  triggeredEvents: string[];
}

export interface EndGameResult {
  scoreResult: ScoreResult;
  isNewRecord: boolean;
  reviewSummary: ReviewSummary;
}

export interface GameActions {
  startGame: (levelId: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => EndGameResult | null;
  addToQueue: (bellId: string, position?: number) => void;
  removeFromQueue: (bellId: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  toggleSelect: (bellId: string) => void;
  selectAllPending: () => void;
  clearSelection: () => void;
  batchReturn: () => void;
  quickReturn: (bellId: string) => void;
  isolateBell: (bellId: string) => void;
  triggerEvent: (event: GameEvent) => void;
  clearEvent: () => void;
  tick: () => void;
  resetGame: () => void;
}

export interface GameProgress {
  unlockedLevels: number[];
  highScores: Record<number, number>;
  completedLevels: number[];
  lastReviewTags: Record<number, string[]>;
}

export interface ScoreRecord {
  levelId: number;
  levelName: string;
  score: ScoreResult;
  date: string;
  reviewSummary?: ReviewSummary;
}

export const STORAGE_KEYS = {
  SCORES: 'tuling_game_scores',
  PROGRESS: 'tuling_game_progress',
} as const;
