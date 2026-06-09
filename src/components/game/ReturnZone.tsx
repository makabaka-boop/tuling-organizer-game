import React from 'react';
import { Archive, CheckCircle } from 'lucide-react';
import { BellItem } from './BellItem';
import { useScoring } from '../../hooks/useScoring';
import { useGameStore } from '../../store/useGameStore';
import { cn } from '../../lib/utils';

interface ReturnZoneProps {
  className?: string;
}

export const ReturnZone: React.FC<ReturnZoneProps> = ({ className }) => {
  const { returnedBells, needReturnBells } = useScoring();
  const { currentLevel } = useGameStore();

  const targetCount = currentLevel?.targetReturnCount || 0;
  const progress = targetCount > 0 ? (returnedBells.length / targetCount) * 100 : 0;

  return (
    <div className={cn('zone-container flex flex-col h-full', className)}>
      <div className="px-4 py-3 border-b border-clay-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-ink-600" />
            <h3 className="font-semibold text-clay-800 font-serif">已归位区</h3>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-ink-500" />
            <span className="text-sm font-medium text-ink-600">
              {returnedBells.length} / {targetCount}
            </span>
          </div>
        </div>
        <div className="mt-2">
          <div className="w-full h-1.5 bg-clay-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-ink-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {returnedBells.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-clay-400">
            <Archive className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-sm">暂无已归位土铃</p>
            <p className="text-xs mt-1">勾选待归位土铃后点击批量归位</p>
          </div>
        ) : (
          returnedBells.map(bell => (
            <BellItem key={bell.id} bell={bell} />
          ))
        )}
      </div>
    </div>
  );
};
