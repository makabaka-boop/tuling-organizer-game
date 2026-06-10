import React from 'react';
import { Bell, ArchiveX, AlertTriangle, Ban, ArrowRight } from 'lucide-react';
import type { Bell as BellType } from '../../utils/types';
import { useGameStore } from '../../store/useGameStore';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface BellItemProps {
  bell: BellType;
  showCheckbox?: boolean;
  showActions?: boolean;
  draggable?: boolean;
  isDragging?: boolean;
  isSelected?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  showPosition?: number;
}

export const BellItem: React.FC<BellItemProps> = ({
  bell,
  showCheckbox = false,
  showActions = false,
  draggable = false,
  isDragging = false,
  isSelected,
  onDragStart,
  onDragEnd,
  showPosition,
}) => {
  const {
    toggleSelect,
    quickReturn,
    isolateBell,
    addToQueue,
    activeEvent,
    selectedBells,
  } = useGameStore();

  const isDisabled = activeEvent?.type === 'delay';
  const checked = isSelected !== undefined ? isSelected : selectedBells.includes(bell.id);

  const handleDragStart = (e: React.DragEvent) => {
    if (isDisabled || bell.disabled || bell.isAbnormal || bell.status !== 'pending') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', bell.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.();
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  const handleDoubleClick = () => {
    if (isDisabled) return;
    if (bell.status === 'pending' && !bell.disabled && !bell.isAbnormal) {
      addToQueue(bell.id);
    }
  };

  const getStatusBadge = () => {
    if (bell.disabled) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 text-gray-500 text-xs rounded-full line-through">
          <Ban className="w-3 h-3" />
          停用
        </span>
      );
    }
    if (bell.isAbnormal && bell.status !== 'isolated') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cinnabar-100 text-cinnabar-600 text-xs rounded-full animate-pulse-soft">
          <AlertTriangle className="w-3 h-3" />
          异常
        </span>
      );
    }
    if (bell.needReturn && bell.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-100 text-gold-700 text-xs rounded-full">
          <ArchiveX className="w-3 h-3" />
          待归位
        </span>
      );
    }
    if (bell.status === 'returned') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ink-100 text-ink-600 text-xs rounded-full">
          已归位
        </span>
      );
    }
    if (bell.status === 'isolated') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cinnabar-100 text-cinnabar-600 text-xs rounded-full">
          已隔离
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        'bell-card p-3 transition-all duration-200',
        isDragging && 'opacity-50 scale-95',
        isSelected && 'ring-2 ring-clay-500 ring-offset-2',
        bell.disabled && 'opacity-60',
        bell.status !== 'pending' && bell.status !== 'queued' && 'opacity-70',
        draggable && bell.status === 'pending' && !bell.disabled && !bell.isAbnormal && 'cursor-grab active:cursor-grabbing',
        'hover:shadow-hover'
      )}
      draggable={draggable && bell.status === 'pending' && !bell.disabled && !bell.isAbnormal && !isDisabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-start gap-3">
        {showCheckbox && bell.needReturn && bell.status === 'pending' && (
          <div className="mt-1">
            <Checkbox
              id={`check-${bell.id}`}
              checked={checked}
              onChange={() => toggleSelect(bell.id)}
              disabled={isDisabled}
            />
          </div>
        )}

        {showPosition !== undefined && (
          <div className="flex-shrink-0 w-8 h-8 bg-clay-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {showPosition}
          </div>
        )}

        <div className="flex-shrink-0 w-10 h-10 bg-clay-100 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-clay-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-clay-800 truncate">{bell.name}</h4>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-clay-500">
            <span className="font-mono">{bell.code}</span>
            <span className="text-clay-300">|</span>
            <span>{bell.category}</span>
          </div>
          {bell.abnormalReason && bell.status !== 'isolated' && (
            <p className="mt-1 text-xs text-cinnabar-500">
              原因：{bell.abnormalReason}
            </p>
          )}
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            {bell.isAbnormal && bell.status !== 'isolated' && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => isolateBell(bell.id)}
                disabled={isDisabled}
                className="text-xs px-2 py-1"
              >
                隔离
              </Button>
            )}
            {bell.needReturn && bell.status === 'pending' && (
              <Button
                variant="success"
                size="sm"
                onClick={() => quickReturn(bell.id)}
                disabled={isDisabled}
                className="text-xs px-2 py-1"
              >
                归位
              </Button>
            )}
            {bell.status === 'pending' && !bell.disabled && !bell.isAbnormal && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addToQueue(bell.id)}
                disabled={isDisabled}
                className="text-xs px-2 py-1"
              >
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
