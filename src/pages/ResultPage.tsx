import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Trophy,
  Home,
  RotateCcw,
  ChevronRight,
  Star,
  Clock,
  Target,
  Archive,
  ShieldAlert,
  Timer,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { getGameProgress, STORAGE_KEYS } from '../utils/storage';
import type { ScoreResult, ReviewSummary } from '../utils/types';
import { cn } from '../lib/utils';

interface LocationState {
  score?: ScoreResult;
  levelId?: number;
  levelName?: string;
  isNewRecord?: boolean;
  reviewSummary?: ReviewSummary;
}

const LEVEL_NAMES: Record<number, string> = {
  1: '初出茅庐',
  2: '渐入佳境',
  3: '游刃有余',
  4: '炉火纯青',
};

export const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [levelId, setLevelId] = useState<number | null>(null);
  const [levelName, setLevelName] = useState<string>('');
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [hasNextLevel, setHasNextLevel] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);

  useEffect(() => {
    const state = location.state as LocationState | null;

    if (state?.score) {
      setScore(state.score);
      setLevelId(state.levelId ?? null);
      setLevelName(state.levelName ?? LEVEL_NAMES[state.levelId ?? 0] ?? '');
      setIsNewHighScore(!!state.isNewRecord);
      setReviewSummary(state.reviewSummary ?? null);

      const progress = getGameProgress(STORAGE_KEYS.PROGRESS);
      const nextLvl = (state.levelId ?? 0) + 1;
      setHasNextLevel(nextLvl <= 4 && progress.unlockedLevels.includes(nextLvl));
    } else {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  const getGradeConfig = (grade: string) => {
    const configs: Record<string, { color: string; bg: string; stars: number }> = {
      S: { color: 'text-gold-600', bg: 'bg-gold-100', stars: 5 },
      A: { color: 'text-clay-600', bg: 'bg-clay-100', stars: 4 },
      B: { color: 'text-ink-600', bg: 'bg-ink-100', stars: 3 },
      C: { color: 'text-clay-500', bg: 'bg-clay-100', stars: 2 },
      D: { color: 'text-cinnabar-500', bg: 'bg-cinnabar-50', stars: 1 },
    };
    return configs[grade] || configs.C;
  };

  const handleRestart = () => {
    if (levelId) {
      navigate(`/game/${levelId}`);
    }
  };

  const handleNextLevel = () => {
    if (levelId && levelId < 4) {
      navigate(`/game/${levelId + 1}`);
    } else {
      navigate('/');
    }
  };

  if (!score) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-clay-600">加载中...</p>
      </div>
    );
  }

  const gradeConfig = getGradeConfig(score.grade);
  const timeUsed = score.timeUsed;

  const scoreItems = [
    {
      icon: Target,
      label: '顺位正确率',
      value: score.orderAccuracy,
      color: 'default' as const,
      weight: '30%',
    },
    {
      icon: Archive,
      label: '返件完整率',
      value: score.returnCompleteness,
      color: 'success' as const,
      weight: '25%',
    },
    {
      icon: ShieldAlert,
      label: '异常隔离及时性',
      value: score.isolationTimeliness,
      color: 'danger' as const,
      weight: '25%',
    },
    {
      icon: Timer,
      label: '整体耗时',
      value: score.timeEfficiency,
      color: 'gold' as const,
      weight: '20%',
    },
  ];

  return (
    <div className="min-h-screen bg-paper paper-texture flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full animate-fade-in">
        <CardHeader className="text-center pb-2">
          {isNewHighScore && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-100 text-gold-700 rounded-full mb-4 text-sm font-medium animate-pulse-soft">
              <Trophy className="w-4 h-4" />
              新纪录！
            </div>
          )}

          <h2 className="text-3xl font-bold text-clay-800 font-serif mb-2">
            关卡完成
          </h2>
          <p className="text-clay-500">{levelName}</p>
        </CardHeader>

        <div className="text-center py-6 bg-clay-50 border-y border-clay-200">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white shadow-card mb-4">
            <div className="text-center">
              <span
                className={cn(
                  'text-6xl font-bold font-serif',
                  gradeConfig.color
                )}
              >
                {score.grade}
              </span>
              <div className="flex justify-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i < gradeConfig.stars
                        ? 'fill-gold-500 text-gold-500'
                        : 'text-clay-200'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-clay-500 mb-1">综合得分</p>
            <p className="text-5xl font-bold text-clay-800 font-serif">
              {score.totalScore}
            </p>
            <div className="flex items-center justify-center gap-2 text-clay-500 mt-2">
              <Clock className="w-4 h-4" />
              <span>用时 {formatTime(timeUsed)}</span>
            </div>
          </div>
        </div>

        <CardContent className="space-y-4">
          <h3 className="font-semibold text-clay-800 mb-4">评分详情</h3>

          {scoreItems.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-clay-500" />
                  <span className="text-clay-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-clay-400">
                    权重 {item.weight}
                  </span>
                </div>
              </div>
              <ProgressBar value={item.value} color={item.color} />
            </div>
          ))}

          {reviewSummary && (
            <div className="mt-6 pt-4 border-t border-clay-200">
              <h3 className="font-semibold text-clay-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-clay-600" />
                赛后复盘
              </h3>

              <div className="space-y-4">
                <div className="p-3 bg-cinnabar-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-cinnabar-600" />
                    <span className="font-medium text-cinnabar-700 text-sm">表现短板</span>
                  </div>
                  <ul className="space-y-1">
                    {reviewSummary.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-cinnabar-700 pl-6">
                        · {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-clay-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-clay-600" />
                    <span className="font-medium text-clay-700 text-sm">关键失分原因</span>
                  </div>
                  <ul className="space-y-1">
                    {reviewSummary.keyReasons.map((r, i) => (
                      <li key={i} className="text-sm text-clay-700 pl-6">
                        · {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-ink-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-ink-600" />
                    <span className="font-medium text-ink-700 text-sm">改进建议</span>
                  </div>
                  <ul className="space-y-1">
                    {reviewSummary.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-ink-700 pl-6">
                        · {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 justify-center">
          <Button variant="ghost" onClick={() => navigate('/tutorial?step=improve')}>
            <BookOpen className="w-4 h-4 mr-2" />
            如何提升评分
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            返回主界面
          </Button>
          <Button variant="secondary" onClick={handleRestart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            再玩一次
          </Button>
          <Button variant="primary" onClick={handleNextLevel}>
            {hasNextLevel ? (
              <>
                下一关
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                返回主界面
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
