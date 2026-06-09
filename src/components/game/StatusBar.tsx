import React from 'react';
import { Clock, Pause, Play, Home, Flag, Trophy } from 'lucide-react';
import { Button } from '../ui/Button';
import { useGameStore } from '../../store/useGameStore';
import { useScoring } from '../../hooks/useScoring';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface StatusBarProps {
  className?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ className }) => {
  const navigate = useNavigate();
  const {
    currentLevel,
    timeRemaining,
    isPaused,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
  } = useGameStore();
  const { currentScores } = useScoring();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining <= 15;

  const handleEndGame = () => {
    if (window.confirm('确定要提前结束当前关卡吗？')) {
      const result = endGame();
      navigate('/result', {
        state: {
          score: result?.scoreResult,
          levelId: currentLevel?.id,
          levelName: currentLevel?.name,
          isNewRecord: result?.isNewRecord,
          reviewSummary: result?.reviewSummary,
        },
      });
    }
  };

  const handleGoHome = () => {
    if (window.confirm('确定要返回主界面吗？当前进度将丢失。')) {
      resetGame();
      navigate('/');
    }
  };

  return (
    <div
      className={cn(
        'bg-white/90 backdrop-blur-sm border-b border-clay-200 shadow-soft px-6 py-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold-600" />
            <div>
              <h2 className="font-bold text-clay-800 font-serif text-lg">
                {currentLevel?.name || '土铃整理'}
              </h2>
              <p className="text-xs text-clay-500">
                难度 {'★'.repeat(currentLevel?.difficulty || 1)}
              </p>
            </div>
          </div>

          <div className="decorative-line w-16 hidden md:block" />

          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              isLowTime ? 'bg-cinnabar-50 animate-pulse-soft' : 'bg-clay-50'
            )}
          >
            <Clock
              className={cn('w-5 h-5', isLowTime ? 'text-cinnabar-500' : 'text-clay-600')}
            />
            <span
              className={cn(
                'font-mono font-bold text-lg',
                isLowTime ? 'text-cinnabar-600' : 'text-clay-700'
              )}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {currentScores && (
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-clay-500">顺位</p>
              <p className="font-bold text-clay-700">{currentScores.orderAccuracy}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-clay-500">归位</p>
              <p className="font-bold text-ink-600">{currentScores.returnCompleteness}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-clay-500">隔离</p>
              <p className="font-bold text-cinnabar-600">{currentScores.isolationTimeliness}%</p>
            </div>
            <div className="text-center px-3 py-1 bg-gold-50 rounded-lg">
              <p className="text-xs text-gold-700">总分</p>
              <p className="font-bold text-gold-700">{currentScores.total}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleGoHome}>
            <Home className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">主界面</span>
          </Button>
          <Button
            variant={isPaused ? 'primary' : 'secondary'}
            size="sm"
            onClick={isPaused ? resumeGame : pauseGame}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-1" />
                继续
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-1" />
                暂停
              </>
            )}
          </Button>
          <Button variant="danger" size="sm" onClick={handleEndGame}>
            <Flag className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">结束</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
