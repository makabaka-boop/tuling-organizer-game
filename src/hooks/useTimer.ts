import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';

export function useTimer() {
  const intervalRef = useRef<number | null>(null);
  const tick = useGameStore(state => state.tick);
  const isRunning = useGameStore(state => state.isRunning);
  const isPaused = useGameStore(state => state.isPaused);
  const activeEvent = useGameStore(state => state.activeEvent);
  const clearEvent = useGameStore(state => state.clearEvent);

  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(() => {
      tick();
    }, 1000);
  }, [tick]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      startTimer();
    } else {
      stopTimer();
    }

    return () => {
      stopTimer();
    };
  }, [isRunning, isPaused, startTimer, stopTimer]);

  useEffect(() => {
    if (activeEvent?.type === 'delay' && activeEvent.duration) {
      const timeout = window.setTimeout(() => {
        clearEvent();
      }, activeEvent.duration! * 1000);

      return () => {
        window.clearTimeout(timeout);
      };
    }

    if (activeEvent && activeEvent.type !== 'delay') {
      const timeout = window.setTimeout(() => {
        clearEvent();
      }, 4000);

      return () => {
        window.clearTimeout(timeout);
      };
    }
  }, [activeEvent, clearEvent]);

  return { startTimer, stopTimer };
}
