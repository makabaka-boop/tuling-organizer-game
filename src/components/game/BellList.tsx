import React from 'react';
import { ListChecks, Bell } from 'lucide-react';
import { BellItem } from './BellItem';
import { Button } from '../ui/Button';
import { useGameStore } from '../../store/useGameStore';
import { useScoring } from '../../hooks/useScoring';
import { cn } from '../../lib/utils';

interface BellListProps {
  className?: string;
}

export const BellList: React.FC<BellListProps> = ({ className }) => {
  const {
    selectAllPending,
    clearSelection,
    batchReturn,
    selectedBells,
    addToQueue,
    activeEvent,
  } = useGameStore();

  const { pendingBells, needReturnBells } = useScoring();

  const isDisabled = activeEvent?.type === 'delay';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const bellId = e.dataTransfer.getData('text/plain');
    if (bellId) {
      useGameStore.getState().removeFromQueue(bellId);
    }
  };

  const pendingNeedReturn = pendingBells.filter(b => b.needReturn);

  return (
    <div
      className={cn('zone-container flex flex-col h-full', className)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="px-4 py-3 border-b border-clay-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-clay-600" />
            <h3 className="font-semibold text-clay-800 font-serif">待处理区</h3>
          </div>
          <span className="text-sm text-clay-500">
            {pendingBells.length} 件
          </span>
        </div>
      </div>

      {pendingNeedReturn.length > 0 && (
        <div className="px-4 py-2 border-b border-clay-200 flex items-center gap-2 flex-shrink-0 bg-gold-50">
          <ListChecks className="w-4 h-4 text-gold-600" />
          <span className="text-sm text-gold-700 flex-1">
            已选 {selectedBells.length} / {pendingNeedReturn.length} 件待归位
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAllPending}
              disabled={isDisabled}
              className="text-xs h-8 px-2"
            >
              全选
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={isDisabled || selectedBells.length === 0}
              className="text-xs h-8 px-2"
            >
              清空
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={batchReturn}
              disabled={isDisabled || selectedBells.length === 0}
              className="text-xs h-8 px-3"
            >
              批量归位
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {pendingBells.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-clay-400">
            <Bell className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-sm">暂无待处理土铃</p>
          </div>
        ) : (
          pendingBells.map(bell => (
            <BellItem
              key={bell.id}
              bell={bell}
              showCheckbox
              showActions
              draggable
            />
          ))
        )}
      </div>
    </div>
  );
};
