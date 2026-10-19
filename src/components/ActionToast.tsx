import React, { useEffect, useState } from 'react';
import { RotateCcw, CheckCircle2, X } from 'lucide-react';

interface ActionToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
}

export const ActionToast: React.FC<ActionToastProps> = ({
  message,
  onUndo,
  onDismiss,
  durationMs = 5000,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remaining);
      if (elapsed >= durationMs) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [durationMs, onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-slate-800 dark:border-slate-700 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium text-slate-100 truncate">{message}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onUndo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors shadow-sm active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>復原 (Undo)</span>
            </button>
            <button
              onClick={onDismiss}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="關閉通知"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
