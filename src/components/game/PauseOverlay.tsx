import React from 'react';
import { Play, Home, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { useGameStore } from '../../store/useGameStore';
import { useNavigate, useParams } from 'react-router-dom';

interface PauseOverlayProps {
  className?: string;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ className }) => {
  const navigate = useNavigate();
  const params = useParams<{ levelId: string }>();
  const { isPaused, resumeGame, resetGame, startGame } = useGameStore();

  if (!isPaused) return null;

  const handleRestart = () => {
    if (params.levelId) {
      resetGame();
      startGame(Number(params.levelId));
    }
  };

  const handleGoHome = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div
      className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in ${className || ''}`}
    >
      <div className="bg-paper rounded-2xl shadow-hover p-8 max-w-md w-full mx-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-clay-100 rounded-full flex items-center justify-center">
          <Play className="w-10 h-10 text-clay-600" />
        </div>

        <h2 className="text-2xl font-bold text-clay-800 font-serif mb-2">游戏暂停</h2>
        <p className="text-clay-500 mb-8">休息一下，准备好后继续挑战</p>

        <div className="decorative-line mb-6" />

        <div className="space-y-3">
          <Button variant="primary" size="lg" className="w-full" onClick={resumeGame}>
            <Play className="w-5 h-5 mr-2" />
            继续游戏
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={handleRestart}>
            <RotateCcw className="w-5 h-5 mr-2" />
            重新开始
          </Button>
          <Button variant="ghost" size="lg" className="w-full" onClick={handleGoHome}>
            <Home className="w-5 h-5 mr-2" />
            返回主界面
          </Button>
        </div>
      </div>
    </div>
  );
};
