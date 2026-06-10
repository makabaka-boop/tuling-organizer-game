import type { Bell, IsolationRecord, ScoreResult, Grade, ReviewSummary } from './types';

export function calculateOrderAccuracy(bells: Bell[], queue: string[]): number {
  if (queue.length === 0) return 0;

  let correctCount = 0;

  for (let i = 0; i < queue.length; i++) {
    const bellId = queue[i];
    const bell = bells.find(b => b.id === bellId);
    if (bell && bell.correctPosition === i + 1) {
      correctCount++;
    }
  }

  const queuableBells = bells.filter(b => !b.disabled && !b.isAbnormal && b.status !== 'returned');
  const totalExpected = queuableBells.length;

  if (totalExpected === 0) return 100;

  return Math.round((correctCount / totalExpected) * 100);
}

export function calculateReturnCompleteness(
  bells: Bell[],
  targetCount: number
): number {
  if (targetCount === 0) return 100;

  const returnedCount = bells.filter(
    b => b.needReturn && b.status === 'returned'
  ).length;

  return Math.min(100, Math.round((returnedCount / targetCount) * 100));
}

export function calculateIsolationTimeliness(
  records: IsolationRecord[],
  appearTimes: Record<string, number>
): number {
  if (records.length === 0) {
    return Object.keys(appearTimes).length > 0 ? 0 : 100;
  }

  const totalRecords = records.length + (Object.keys(appearTimes).length - records.length);
  if (totalRecords === 0) return 100;

  let totalScore = 0;

  records.forEach(record => {
    const appearTime = appearTimes[record.bellId];
    if (appearTime !== undefined) {
      const delay = record.time - appearTime;
      if (delay <= 3) {
        totalScore += 100;
      } else {
        const penalty = Math.min(70, (delay - 3) * 10);
        totalScore += Math.max(30, 100 - penalty);
      }
    } else {
      totalScore += 50;
    }
  });

  const unisolatedCount = Object.keys(appearTimes).filter(
    id => !records.some(r => r.bellId === id)
  ).length;

  return Math.round(totalScore / totalRecords);
}

export function calculateTimeEfficiency(
  timeUsed: number,
  totalTime: number
): number {
  if (totalTime === 0) return 0;
  const remaining = Math.max(0, totalTime - timeUsed);
  return Math.round((remaining / totalTime) * 100);
}

export function calculateTotalScore(components: {
  orderAccuracy: number;
  returnCompleteness: number;
  isolationTimeliness: number;
  timeEfficiency: number;
}): number {
  const weighted =
    components.orderAccuracy * 0.3 +
    components.returnCompleteness * 0.25 +
    components.isolationTimeliness * 0.25 +
    components.timeEfficiency * 0.2;

  return Math.round(weighted);
}

export function getGrade(score: number): Grade {
  if (score >= 95) return 'S';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

export function calculateFinalScore(
  bells: Bell[],
  queue: string[],
  targetReturnCount: number,
  isolationRecords: IsolationRecord[],
  abnormalAppearTimes: Record<string, number>,
  timeUsed: number,
  totalTime: number
): ScoreResult {
  const orderAccuracy = calculateOrderAccuracy(bells, queue);
  const returnCompleteness = calculateReturnCompleteness(bells, targetReturnCount);
  const isolationTimeliness = calculateIsolationTimeliness(
    isolationRecords,
    abnormalAppearTimes
  );
  const timeEfficiency = calculateTimeEfficiency(timeUsed, totalTime);

  const totalScore = calculateTotalScore({
    orderAccuracy,
    returnCompleteness,
    isolationTimeliness,
    timeEfficiency,
  });

  const grade = getGrade(totalScore);

  return {
    orderAccuracy,
    returnCompleteness,
    isolationTimeliness,
    timeEfficiency,
    totalScore,
    grade,
    timeUsed,
  };
}

interface DimensionResult {
  key: string;
  label: string;
  score: number;
  weight: number;
  weightedLoss: number;
}

export function generateReviewSummary(score: ScoreResult): ReviewSummary {
  const dimensions: DimensionResult[] = [
    {
      key: 'order',
      label: '顺位正确率',
      score: score.orderAccuracy,
      weight: 0.3,
      weightedLoss: (100 - score.orderAccuracy) * 0.3,
    },
    {
      key: 'return',
      label: '返件完整率',
      score: score.returnCompleteness,
      weight: 0.25,
      weightedLoss: (100 - score.returnCompleteness) * 0.25,
    },
    {
      key: 'isolation',
      label: '异常隔离及时性',
      score: score.isolationTimeliness,
      weight: 0.25,
      weightedLoss: (100 - score.isolationTimeliness) * 0.25,
    },
    {
      key: 'time',
      label: '耗时效率',
      score: score.timeEfficiency,
      weight: 0.2,
      weightedLoss: (100 - score.timeEfficiency) * 0.2,
    },
  ];

  const sorted = [...dimensions].sort((a, b) => b.weightedLoss - a.weightedLoss);
  const weaknesses: string[] = [];
  const keyReasons: string[] = [];
  const suggestions: string[] = [];
  const tags: string[] = [];

  for (const dim of sorted) {
    if (dim.score >= 90) {
      if (dim.key === 'order') tags.push('顺位处理稳定');
      else if (dim.key === 'return') tags.push('返件处理稳定');
      else if (dim.key === 'isolation') tags.push('异常隔离迅速');
      else if (dim.key === 'time') tags.push('耗时效率高');
      continue;
    }

    if (dim.score >= 70) {
      if (dim.key === 'order') tags.push('顺位基本正确');
      else if (dim.key === 'return') tags.push('返件基本完成');
      else if (dim.key === 'isolation') tags.push('异常隔离一般');
      else if (dim.key === 'time') tags.push('耗时适中');
    } else if (dim.score >= 50) {
      if (dim.key === 'order') tags.push('顺位需优化');
      else if (dim.key === 'return') tags.push('返件不完整');
      else if (dim.key === 'isolation') tags.push('异常隔离偏慢');
      else if (dim.key === 'time') tags.push('耗时偏长');
    } else {
      if (dim.key === 'order') tags.push('顺位严重失误');
      else if (dim.key === 'return') tags.push('返件大量遗漏');
      else if (dim.key === 'isolation') tags.push('异常隔离缺失');
      else if (dim.key === 'time') tags.push('耗时过长');
    }

    if (weaknesses.length < 2) {
      weaknesses.push(`${dim.label}仅 ${dim.score} 分`);
    }

    if (keyReasons.length < 3) {
      if (dim.key === 'order' && dim.score < 70) {
        keyReasons.push('出场顺序排列错误较多，注意编号与位置的对应关系');
      } else if (dim.key === 'return' && dim.score < 70) {
        keyReasons.push('部分待归位土铃未及时处理，留意"待归位"标签');
      } else if (dim.key === 'isolation' && dim.score < 70) {
        keyReasons.push('异常件隔离不够及时，发现后应在3秒内操作');
      } else if (dim.key === 'time' && dim.score < 70) {
        keyReasons.push('操作耗时过长，尝试减少犹豫和重复操作');
      }
    }

    if (suggestions.length < 2) {
      if (dim.key === 'order' && dim.score < 90) {
        suggestions.push('优先确认土铃编号与正确位置的对应关系，减少排列错误');
      } else if (dim.key === 'return' && dim.score < 90) {
        suggestions.push('使用"全选"快速勾选所有待归位土铃，提高返件效率');
      } else if (dim.key === 'isolation' && dim.score < 90) {
        suggestions.push('发现异常件后立即隔离，3秒内操作可获得满分');
      } else if (dim.key === 'time' && dim.score < 90) {
        suggestions.push('提前完成可获得时间效率加分，尽量减少不必要的操作');
      }
    }
  }

  if (weaknesses.length === 0) {
    weaknesses.push('整体表现优秀');
  }
  if (keyReasons.length === 0) {
    keyReasons.push('各维度均表现良好，继续保持');
  }
  if (suggestions.length === 0) {
    suggestions.push('保持当前节奏，挑战更高分数');
  }

  return {
    weaknesses,
    keyReasons,
    suggestions,
    tags: tags.slice(0, 3),
  };
}
