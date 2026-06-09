import React, { useState } from 'react';
import { ListOrdered, X, GripVertical } from 'lucide-react';
import { BellItem } from './BellItem';
import { useGameStore } from '../../store/useGameStore';
import { useScoring } from '../../hooks/useScoring';
import { cn } from '../../lib/utils';

interface SortableQueueProps {
  className?: string;
}

export const SortableQueue: React.FC<SortableQueueProps> = ({ className }) => {
  const { queue, removeFromQueue, reorderQueue, addToQueue, activeEvent, bells } =
    useGameStore();
  const { queuedBells } = useScoring();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const isDisabled = activeEvent?.type === 'delay';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnZone = (e: React.DragEvent) => {
    e.preventDefault();
    const bellId = e.dataTransfer.getData('text/plain');
    if (!bellId || isDisabled) return;

    const fromIndex = queue.indexOf(bellId);

    if (fromIndex === -1) {
      const bell = bells.find(b => b.id === bellId);
      if (bell && !bell.disabled && !bell.isAbnormal && bell.status === 'pending') {
        addToQueue(bellId);
      }
    }

    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', queue[index]);
    e.dataTransfer.effectAllowed = 'move';
    setDragIndex(index);
  };

  const handleItemDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIndex === null || dragIndex === index || isDisabled) return;
    setDragOverIndex(index);
  };

  const handleItemDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDisabled) return;

    const bellId = e.dataTransfer.getData('text/plain');
    if (!bellId) return;

    const fromIndex = queue.indexOf(bellId);

    if (fromIndex !== -1 && fromIndex !== targetIndex) {
      reorderQueue(fromIndex, targetIndex);
    }

    setDragIndex(null);
    setDragOverIndex(null);
  };

  const queueBellsWithPositions = queue.map((id, index) => {
    const bell = queuedBells.find(b => b.id === id);
    return bell ? { bell, position: index + 1 } : null;
  }).filter(Boolean) as { bell: typeof queuedBells[0]; position: number }[];

  const expectedCount = bells.filter(b => !b.disabled && !b.isAbnormal).length;

  return (
    <div
      className={cn('zone-container flex flex-col h-full', className)}
      onDragOver={handleDragOver}
      onDrop={handleDropOnZone}
    >
      <div className="px-4 py-3 border-b border-clay-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-clay-600" />
            <h3 className="font-semibold text-clay-800 font-serif">出场顺位队列</h3>
          </div>
          <span className="text-sm text-clay-500">
            {queue.length} / {expectedCount} 件
          </span>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-clay-200 bg-clay-50 flex-shrink-0">
        <p className="text-xs text-clay-500">
          提示：拖拽土铃到此处或双击土铃添加到队列；拖拽队列内土铃调整顺序
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {queueBellsWithPositions.length === 0 ? (
          <div
            className={cn(
              'h-full min-h-40 border-2 border-dashed border-clay-300 rounded-xl flex flex-col items-center justify-center text-clay-400 transition-colors',
              'hover:border-clay-400 hover:bg-clay-50'
            )}
          >
            <ListOrdered className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-sm">拖拽土铃到此处建立出场顺序</p>
          </div>
        ) : (
          queueBellsWithPositions.map(({ bell, position }, index) => (
            <div
              key={bell.id}
              draggable={!isDisabled}
              onDragStart={(e) => handleItemDragStart(e, index)}
              onDragEnd={handleItemDragEnd}
              onDragOver={(e) => handleItemDragOver(e, index)}
              onDrop={(e) => handleItemDrop(e, index)}
              className={cn(
                'transition-all duration-200',
                dragIndex === index && 'opacity-50',
                dragOverIndex === index && 'border-t-2 border-clay-500'
              )}
            >
              <div className="relative group">
                <BellItem
                  bell={bell}
                  showPosition={position}
                  isDragging={dragIndex === index}
                />
                <div
                  className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                  onMouseDown={e => e.stopPropagation()}
                >
                  <GripVertical className="w-4 h-4 text-clay-400" />
                </div>
                <button
                  onClick={() => !isDisabled && removeFromQueue(bell.id)}
                  disabled={isDisabled}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white rounded-full shadow-soft opacity-0 group-hover:opacity-100 transition-opacity hover:bg-clay-100 disabled:opacity-30"
                >
                  <X className="w-4 h-4 text-clay-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
