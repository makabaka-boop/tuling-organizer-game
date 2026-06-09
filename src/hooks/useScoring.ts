import { useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  calculateOrderAccuracy,
  calculateReturnCompleteness,
  calculateIsolationTimeliness,
} from '../utils/scoring';

export function useScoring() {
  const bells = useGameStore(state => state.bells);
  const queue = useGameStore(state => state.queue);
  const currentLevel = useGameStore(state => state.currentLevel);
  const isolationRecords = useGameStore(state => state.isolationRecords);
  const abnormalAppearTimes = useGameStore(state => state.abnormalAppearTimes);
  const timeRemaining = useGameStore(state => state.timeRemaining);
  const totalTime = useGameStore(state => state.totalTime);

  const currentScores = useMemo(() => {
    if (!currentLevel) return null;

    const orderAccuracy = calculateOrderAccuracy(bells, queue);
    const returnCompleteness = calculateReturnCompleteness(
      bells,
      currentLevel.targetReturnCount
    );
    const isolationTimeliness = calculateIsolationTimeliness(
      isolationRecords,
      abnormalAppearTimes
    );
    const timeEfficiency = Math.round((timeRemaining / totalTime) * 100);

    const total = Math.round(
      orderAccuracy * 0.3 +
        returnCompleteness * 0.25 +
        isolationTimeliness * 0.25 +
        timeEfficiency * 0.2
    );

    return {
      orderAccuracy,
      returnCompleteness,
      isolationTimeliness,
      timeEfficiency,
      total,
    };
  }, [bells, queue, currentLevel, isolationRecords, abnormalAppearTimes, timeRemaining, totalTime]);

  const pendingBells = useMemo(
    () => bells.filter(b => b.status === 'pending'),
    [bells]
  );

  const queuedBells = useMemo(
    () => bells.filter(b => b.status === 'queued'),
    [bells]
  );

  const returnedBells = useMemo(
    () => bells.filter(b => b.status === 'returned'),
    [bells]
  );

  const isolatedBells = useMemo(
    () => bells.filter(b => b.status === 'isolated'),
    [bells]
  );

  const abnormalBells = useMemo(
    () => bells.filter(b => b.isAbnormal),
    [bells]
  );

  const needReturnBells = useMemo(
    () => bells.filter(b => b.needReturn),
    [bells]
  );

  return {
    currentScores,
    pendingBells,
    queuedBells,
    returnedBells,
    isolatedBells,
    abnormalBells,
    needReturnBells,
  };
}
