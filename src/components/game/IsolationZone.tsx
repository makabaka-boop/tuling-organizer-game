import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import { BellItem } from './BellItem';
import { useScoring } from '../../hooks/useScoring';
import { cn } from '../../lib/utils';

interface IsolationZoneProps {
  className?: string;
}

export const IsolationZone: React.FC<IsolationZoneProps> = ({ className }) => {
  const { isolatedBells, abnormalBells } = useScoring();

  const totalAbnormal = abnormalBells.length;
  const isolatedCount = isolatedBells.length;
  const remaining = totalAbnormal - isolatedCount;

  return (
    <div className={cn('zone-container flex flex-col h-full', className)}>
      <div className="px-4 py-3 border-b border-clay-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cinnabar-600" />
            <h3 className="font-semibold text-clay-800 font-serif">异常隔离区</h3>
          </div>
          <div className="flex items-center gap-2">
            {remaining > 0 && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 bg-cinnabar-100 text-cinnabar-600 rounded-full animate-pulse-soft">
                <AlertTriangle className="w-3 h-3" />
                {remaining} 件待处理
              </span>
            )}
            {remaining === 0 && totalAbnormal > 0 && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 bg-ink-100 text-ink-600 rounded-full">
                <CheckCircle className="w-3 h-3" />
                全部隔离
              </span>
            )}
          </div>
        </div>
        {totalAbnormal > 0 && (
          <div className="mt-2">
            <div className="w-full h-1.5 bg-clay-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-cinnabar-500 rounded-full transition-all duration-500"
                style={{ width: `${totalAbnormal > 0 ? (isolatedCount / totalAbnormal) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isolatedBells.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-clay-400">
            <ShieldAlert className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-sm">
              {totalAbnormal === 0 ? '本关无异常件' : '暂无已隔离土铃'}
            </p>
            {totalAbnormal > 0 && (
              <p className="text-xs mt-1 text-cinnabar-500">
                发现异常件请及时点击「隔离」按钮
              </p>
            )}
          </div>
        ) : (
          isolatedBells.map(bell => (
            <BellItem key={bell.id} bell={bell} />
          ))
        )}
      </div>
    </div>
  );
};
