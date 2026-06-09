import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'gold';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'default',
  showLabel = true,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorClasses = {
    default: 'bg-clay-500',
    success: 'bg-ink-600',
    warning: 'bg-gold-500',
    danger: 'bg-cinnabar-500',
    gold: 'bg-gold-600',
  };

  const bgColorClasses = {
    default: 'bg-clay-200',
    success: 'bg-ink-200',
    warning: 'bg-gold-200',
    danger: 'bg-cinnabar-200',
    gold: 'bg-gold-200',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <span className="text-sm text-clay-600 font-medium">
            {Math.round(value)}%
          </span>
        )}
      </div>
      <div className={cn('w-full h-2 rounded-full overflow-hidden', bgColorClasses[color])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
