import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BellList } from '../components/game/BellList';
import { SortableQueue } from '../components/game/SortableQueue';
import { ReturnZone } from '../components/game/ReturnZone';
import { IsolationZone } from '../components/game/IsolationZone';
import { StatusBar } from '../components/game/StatusBar';
import { EventToast } from '../components/game/EventToast';
import { PauseOverlay } from '../components/game/PauseOverlay';
import { useGameStore } from '../store/useGameStore';
import { useTimer } from '../hooks/useTimer';
import { Button } from '../components/ui/Button';
import { AlertCircle } from 'lucide-react';
import { getGameProgress, STORAGE_KEYS } from '../utils/storage';

export const GamePage: React.FC = () => {
  const params = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { startGame, isRunning, currentLevel, isPaused, activeEvent, endGame, resetGame, timeRemaining } =
    useGameStore();
  const hasNavigatedRef = useRef(false);
  const [locked, setLocked] = useState(false);

  useTimer();

  useEffect(() => {
    const levelId = Number(params.levelId);
    if (!isNaN(levelId)) {
      const progress = getGameProgress(STORAGE_KEYS.PROGRESS);
      if (!progress.unlockedLevels.includes(levelId)) {
        setLocked(true);
        return;
      }
      startGame(levelId);
    }

    return () => {
      resetGame();
    };
  }, [params.levelId, startGame, resetGame]);

  useEffect(() => {
    if (currentLevel && timeRemaining <= 0 && isRunning && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      const result = endGame();
      navigate('/result', {
        state: {
          score: result?.scoreResult,
          levelId: currentLevel.id,
          levelName: currentLevel.name,
          isNewRecord: result?.isNewRecord,
          reviewSummary: result?.reviewSummary,
        },
      });
    }
  }, [timeRemaining, isRunning, currentLevel, navigate, endGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (isPaused) {
          useGameStore.getState().resumeGame();
        } else {
          useGameStore.getState().pauseGame();
        }
      }
      if (e.code === 'Escape' && !e.repeat) {
        e.preventDefault();
        if (isPaused) {
          useGameStore.getState().resumeGame();
        } else {
          useGameStore.getState().pauseGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused]);

  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-clay-400 mx-auto mb-4" />
          <p className="text-clay-600 mb-4">该关卡尚未解锁</p>
          <p className="text-clay-400 text-sm mb-4">请先完成前一关卡以解锁此关卡</p>
          <Button onClick={() => navigate('/')}>返回主界面</Button>
        </div>
      </div>
    );
  }

  if (!currentLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-clay-400 mx-auto mb-4" />
          <p className="text-clay-600 mb-4">关卡加载失败</p>
          <Button onClick={() => navigate('/')}>返回主界面</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper paper-texture flex flex-col">
      <StatusBar />

      {activeEvent?.type === 'delay' && (
        <div className="bg-black/20 backdrop-blur-sm absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 px-8 py-6 rounded-2xl text-center shadow-hover animate-pulse-soft">
            <p className="text-xl font-bold text-clay-800 font-serif mb-2">
              {activeEvent.message}
            </p>
            <p className="text-clay-500">请稍候...</p>
          </div>
        </div>
      )}

      <EventToast />
      <PauseOverlay />

      <main className="flex-1 p-4 overflow-y-auto lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-full">
          <div className="lg:col-span-4 lg:h-full lg:min-h-0 min-h-[280px]">
            <BellList className="h-full" />
          </div>

          <div className="lg:col-span-4 lg:h-full lg:min-h-0 min-h-[280px]">
            <SortableQueue className="h-full" />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4 lg:h-full lg:min-h-0">
            <div className="flex-1 min-h-[200px] lg:min-h-0">
              <ReturnZone className="h-full" />
            </div>
            <div className="flex-1 min-h-[200px] lg:min-h-0">
              <IsolationZone className="h-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
