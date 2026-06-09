import { create } from 'zustand';
import type {
  GameState,
  GameActions,
  Bell,
  GameEvent,
  ScoreResult,
  ReviewSummary,
} from '../utils/types';
import { getLevelById, cloneLevel } from '../data/levels';
import { calculateFinalScore, generateReviewSummary } from '../utils/scoring';
import { STORAGE_KEYS, updateProgressAfterGame, getGameProgress } from '../utils/storage';

const initialState: GameState = {
  currentLevel: null,
  bells: [],
  queue: [],
  selectedBells: [],
  timeRemaining: 0,
  totalTime: 0,
  isPaused: false,
  isRunning: false,
  activeEvent: null,
  isolationRecords: [],
  abnormalAppearTimes: {},
  triggeredEvents: [],
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  startGame: (levelId: number) => {
    const level = getLevelById(levelId);
    if (!level) return;

    const clonedLevel = cloneLevel(level);

    const abnormalBells = clonedLevel.bells.filter(b => b.isAbnormal);
    const abnormalTimes: Record<string, number> = {};
    abnormalBells.forEach(bell => {
      abnormalTimes[bell.id] = 0;
    });

    set({
      currentLevel: clonedLevel,
      bells: clonedLevel.bells,
      queue: [],
      selectedBells: [],
      timeRemaining: clonedLevel.totalTime,
      totalTime: clonedLevel.totalTime,
      isPaused: false,
      isRunning: true,
      activeEvent: null,
      isolationRecords: [],
      abnormalAppearTimes: abnormalTimes,
      triggeredEvents: [],
    });
  },

  pauseGame: () => {
    set({ isPaused: true });
  },

  resumeGame: () => {
    set({ isPaused: false });
  },

  endGame: () => {
    const state = get();
    if (!state.currentLevel) return null;

    const timeUsed = state.totalTime - state.timeRemaining;
    const scoreResult = calculateFinalScore(
      state.bells,
      state.queue,
      state.currentLevel.targetReturnCount,
      state.isolationRecords,
      state.abnormalAppearTimes,
      timeUsed,
      state.totalTime
    );

    const reviewSummary = generateReviewSummary(scoreResult);

    const prevProgress = getGameProgress(STORAGE_KEYS.PROGRESS);
    const prevHigh = prevProgress.highScores[state.currentLevel.id];
    const isNewRecord = !prevHigh || scoreResult.totalScore > prevHigh;

    updateProgressAfterGame(
      STORAGE_KEYS.PROGRESS,
      STORAGE_KEYS.SCORES,
      state.currentLevel.id,
      state.currentLevel.name,
      scoreResult.totalScore,
      scoreResult,
      reviewSummary
    );

    set({ isRunning: false });

    return { scoreResult, isNewRecord, reviewSummary };
  },

  addToQueue: (bellId: string, position?: number) => {
    const state = get();
    const bell = state.bells.find(b => b.id === bellId);
    if (!bell || bell.disabled || bell.isAbnormal || bell.status === 'queued') return;
    if (state.activeEvent?.type === 'delay') return;

    const newBells = state.bells.map(b =>
      b.id === bellId ? { ...b, status: 'queued' as const } : b
    );

    let newQueue = [...state.queue];
    if (position !== undefined && position >= 0 && position <= newQueue.length) {
      newQueue.splice(position, 0, bellId);
    } else {
      newQueue.push(bellId);
    }

    set({
      bells: newBells,
      queue: newQueue,
    });
  },

  removeFromQueue: (bellId: string) => {
    const state = get();
    if (state.activeEvent?.type === 'delay') return;

    const newBells = state.bells.map(b =>
      b.id === bellId ? { ...b, status: 'pending' as const } : b
    );
    const newQueue = state.queue.filter(id => id !== bellId);

    set({
      bells: newBells,
      queue: newQueue,
    });
  },

  reorderQueue: (fromIndex: number, toIndex: number) => {
    const state = get();
    if (state.activeEvent?.type === 'delay') return;

    const newQueue = [...state.queue];
    const [removed] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, removed);

    set({ queue: newQueue });
  },

  toggleSelect: (bellId: string) => {
    const state = get();
    if (state.activeEvent?.type === 'delay') return;

    const bell = state.bells.find(b => b.id === bellId);
    if (!bell || !bell.needReturn || bell.status !== 'pending') return;

    const newSelected = state.selectedBells.includes(bellId)
      ? state.selectedBells.filter(id => id !== bellId)
      : [...state.selectedBells, bellId];

    set({ selectedBells: newSelected });
  },

  selectAllPending: () => {
    const state = get();
    if (state.activeEvent?.type === 'delay') return;

    const selectableIds = state.bells
      .filter(b => b.needReturn && b.status === 'pending')
      .map(b => b.id);

    set({ selectedBells: selectableIds });
  },

  clearSelection: () => {
    set({ selectedBells: [] });
  },

  batchReturn: () => {
    const state = get();
    if (state.activeEvent?.type === 'delay') return;
    if (state.selectedBells.length === 0) return;

    const newBells = state.bells.map(b =>
      state.selectedBells.includes(b.id)
        ? { ...b, status: 'returned' as const }
        : b
    );

    set({
      bells: newBells,
      selectedBells: [],
    });
  },

  quickReturn: (bellId: string) => {
    const state = get();
    if (state.activeEvent?.type === 'delay') return;

    const bell = state.bells.find(b => b.id === bellId);
    if (!bell || !bell.needReturn) return;

    const newBells = state.bells.map(b =>
      b.id === bellId ? { ...b, status: 'returned' as const } : b
    );
    const newSelected = state.selectedBells.filter(id => id !== bellId);

    set({
      bells: newBells,
      selectedBells: newSelected,
    });
  },

  isolateBell: (bellId: string) => {
    const state = get();
    if (state.activeEvent?.type === 'delay') return;

    const bell = state.bells.find(b => b.id === bellId);
    if (!bell || !bell.isAbnormal) return;

    const newBells = state.bells.map(b =>
      b.id === bellId ? { ...b, status: 'isolated' as const } : b
    );

    const newRecords = [
      ...state.isolationRecords,
      { bellId, time: state.totalTime - state.timeRemaining },
    ];

    set({
      bells: newBells,
      isolationRecords: newRecords,
    });
  },

  triggerEvent: (event: GameEvent) => {
    const state = get();

    if (state.triggeredEvents.includes(event.id)) return;

    let newBells = state.bells;
    let newQueue = state.queue;

    switch (event.type) {
      case 'shuffle':
        if (event.targetBellIds) {
          const indices = event.targetBellIds
            .map(id => state.queue.indexOf(id))
            .filter(i => i >= 0)
            .sort((a, b) => a - b);

          if (indices.length >= 2) {
            const elements = indices.map(i => state.queue[i]);
            const shuffled = shuffleArray(elements);
            newQueue = [...state.queue];
            indices.forEach((idx, i) => {
              newQueue[idx] = shuffled[i];
            });
          }
        }
        break;

      case 'disable':
        if (event.targetBellIds) {
          const targetIds = event.targetBellIds;
          newBells = state.bells.map(b => {
            if (targetIds.includes(b.id)) {
              const wasQueued = b.status === 'queued';
              return {
                ...b,
                disabled: true,
                status: wasQueued ? 'pending' as const : b.status,
              };
            }
            return b;
          });
          newQueue = state.queue.filter(id => !targetIds.includes(id));
        }
        break;

      case 'missing':
        if (event.targetBellIds) {
          newBells = state.bells.map(b => {
            if (event.targetBellIds!.includes(b.id) && !b.needReturn) {
              return { ...b, needReturn: true };
            }
            return b;
          });
        }
        break;
    }

    set({
      activeEvent: event,
      bells: newBells,
      queue: newQueue,
      triggeredEvents: [...state.triggeredEvents, event.id],
    });
  },

  clearEvent: () => {
    set({ activeEvent: null });
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || state.isPaused) return;

    const newTimeRemaining = state.timeRemaining - 1;
    set({ timeRemaining: newTimeRemaining });

    if (state.currentLevel) {
      const elapsed = state.totalTime - newTimeRemaining;
      state.currentLevel.events.forEach(event => {
        if (
          event.triggerTime === elapsed &&
          !state.triggeredEvents.includes(event.id)
        ) {
          get().triggerEvent(event);
        }
      });
    }
  },

  resetGame: () => {
    set(initialState);
  },
}));
