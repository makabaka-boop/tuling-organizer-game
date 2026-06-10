import React from 'react';
import { AlertTriangle, Clock, Ban, FileQuestion, Shuffle } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { cn } from '../../lib/utils';

interface EventToastProps {
  className?: string;
}

export const EventToast: React.FC<EventToastProps> = ({ className }) => {
  const { activeEvent } = useGameStore();

  if (!activeEvent) return null;

  const eventIcons = {
    shuffle: <Shuffle className="w-5 h-5" />,
    missing: <FileQuestion className="w-5 h-5" />,
    disable: <Ban className="w-5 h-5" />,
    delay: <Clock className="w-5 h-5" />,
  };

  const eventColors = {
    shuffle: 'bg-gold-500 text-white',
    missing: 'bg-ink-500 text-white',
    disable: 'bg-ink-600 text-white',
    delay: 'bg-clay-600 text-white',
  };

  return (
    <div
      className={cn(
        'fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 px-6 py-3 rounded-xl shadow-hover max-w-lg',
          eventColors[activeEvent.type]
        )}
      >
        <div className="flex-shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="font-medium">{activeEvent.message}</p>
          {activeEvent.type === 'delay' && activeEvent.duration && (
            <p className="text-sm opacity-90 mt-0.5">
              预计持续 {activeEvent.duration} 秒
            </p>
          )}
        </div>
        <div className="flex-shrink-0 opacity-80">
          {eventIcons[activeEvent.type]}
        </div>
      </div>
    </div>
  );
};
