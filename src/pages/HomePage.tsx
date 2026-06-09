import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen, Trophy, Star, Lock, ChevronRight, Bell } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { levels } from '../data/levels';
import { getGameProgress, STORAGE_KEYS } from '../utils/storage';
import type { GameProgress, ScoreRecord } from '../utils/types';
import { getScoreRecords } from '../utils/storage';
import { cn } from '../lib/utils';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [showScores, setShowScores] = useState(false);
  const [scores, setScores] = useState<ScoreRecord[]>([]);

  useEffect(() => {
    setProgress(getGameProgress(STORAGE_KEYS.PROGRESS));
  }, []);

  useEffect(() => {
    if (showScores) {
      setScores(getScoreRecords(STORAGE_KEYS.SCORES));
    }
  }, [showScores]);

  const handleStartGame = (levelId: number) => {
    navigate(`/game/${levelId}`);
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      S: 'text-gold-600 bg-gold-100',
      A: 'text-clay-600 bg-clay-100',
      B: 'text-ink-600 bg-ink-100',
      C: 'text-clay-500 bg-clay-100',
      D: 'text-cinnabar-500 bg-cinnabar-50',
    };
    return colors[grade] || 'text-clay-600 bg-clay-100';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-paper paper-texture">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="mb-4">
            <Bell className="w-20 h-20 mx-auto text-clay-600 mb-4" />
          </div>
          <h1 className="text-5xl font-bold text-clay-800 font-serif mb-3 title-decoration">
            土铃整理
          </h1>
          <p className="text-clay-500 text-lg max-w-xl mx-auto">
            民艺展演现场管理 · 土铃出场顺序 · 返件归位 · 异常件隔离
          </p>
        </header>

        <div className="decorative-line mb-8" />

        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowScores(!showScores)}
          >
            <Trophy className="w-5 h-5 mr-2" />
            {showScores ? '返回关卡' : '成绩榜'}
          </Button>
          <Button variant="primary" size="lg" onClick={() => navigate('/tutorial')}>
            <BookOpen className="w-5 h-5 mr-2" />
            游戏教程
          </Button>
        </div>

        {showScores ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
            <h3 className="text-xl font-bold text-clay-800 font-serif flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold-600" />
              历史成绩
            </h3>
          </CardHeader>
            <CardContent>
              {scores.length === 0 ? (
                <div className="text-center py-8 text-clay-500">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无成绩记录</p>
                  <p className="text-sm mt-1">完成关卡后成绩将显示在这里</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scores.map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-clay-50 rounded-lg hover:bg-clay-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-clay-400 font-mono text-sm">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-clay-800">{record.levelName}</p>
                          <p className="text-xs text-clay-500">{formatDate(record.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full font-bold',
                            getGradeColor(record.score.grade)
                          )}
                        >
                          {record.score.grade}
                        </span>
                        <span className="font-bold text-clay-700 min-w-16 text-right">
                          {record.score.totalScore} 分
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {levels.map((level) => {
              const isUnlocked = progress?.unlockedLevels.includes(level.id);
              const highScore = progress?.highScores[level.id];
              const isCompleted = progress?.completedLevels.includes(level.id);
              const reviewTags = progress?.lastReviewTags[level.id];

              return (
                <Card
                  key={level.id}
                  hoverable={isUnlocked}
                  className={cn(
                    'transition-all duration-300',
                    !isUnlocked && 'opacity-60'
                  )}
                  onClick={() => isUnlocked && handleStartGame(level.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold',
                            isUnlocked
                              ? 'bg-clay-100 text-clay-700'
                              : 'bg-clay-200 text-clay-500'
                          )}
                        >
                          {level.id}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-clay-800 font-serif">
                            {level.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'w-4 h-4',
                                  i < level.difficulty
                                    ? 'fill-gold-500 text-gold-500'
                                    : 'text-clay-200'
                                )}
                              />
                            ))}
                            <span className="text-xs text-clay-500 ml-2">
                              难度
                            </span>
                          </div>
                        </div>
                      </div>
                      {!isUnlocked && (
                        <Lock className="w-6 h-6 text-clay-400" />
                      )}
                      {isCompleted && (
                        <span className="px-2 py-1 bg-ink-100 text-ink-600 text-xs rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-ink-600" />
                          已通关
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-clay-600 mb-4">{level.description}</p>

                    {reviewTags && reviewTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span
                          className={cn(
                            'px-2 py-0.5 text-xs rounded-full',
                            reviewTags[0].includes('稳定') || reviewTags[0].includes('迅速') || reviewTags[0].includes('效率高')
                              ? 'bg-ink-50 text-ink-600'
                              : reviewTags[0].includes('需优化') || reviewTags[0].includes('偏慢') || reviewTags[0].includes('偏长') || reviewTags[0].includes('失误') || reviewTags[0].includes('遗漏') || reviewTags[0].includes('缺失') || reviewTags[0].includes('过长') || reviewTags[0].includes('不完整')
                                ? 'bg-cinnabar-50 text-cinnabar-600'
                                : 'bg-clay-100 text-clay-600'
                          )}
                        >
                          {reviewTags[0]}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-clay-500">
                        <span>⏱ {level.totalTime}秒</span>
                        <span>🔔 {level.bells.length}件</span>
                        {highScore !== undefined && (
                          <span className="text-gold-600 font-medium">
                            最高分: {highScore}
                          </span>
                        )}
                      </div>
                      {isUnlocked && (
                        <Button variant="primary" size="sm">
                          <Play className="w-4 h-4 mr-1" />
                          开始
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12 text-clay-400 text-sm">
          <p>完成当前关卡可解锁下一关卡</p>
          <p className="mt-1">快捷键：空格键暂停/继续</p>
        </div>
      </div>
    </div>
  );
};
