import React, { useState } from 'react';
import { RefreshCw, X, Sparkles, MessageSquare } from 'lucide-react';

interface SwapRecipeModalProps {
  currentRecipeTitle: string;
  isSwapping: boolean;
  onConfirmSwap: (feedback: string) => void;
  onClose: () => void;
}

const SWAP_REASONS = [
  '想喝溫熱的湯品，不想吃炒菜',
  '不想要重口味，換清淡少油的',
  '改用微波爐或電鍋搞定，不想開火洗鍋',
  '換成更飽足的高蛋白質菜色',
  '想換更開胃酸甜的口味',
];

export const SwapRecipeModal: React.FC<SwapRecipeModalProps> = ({
  currentRecipeTitle,
  isSwapping,
  onConfirmSwap,
  onClose,
}) => {
  const [feedback, setFeedback] = useState('');

  const handleSelectQuickReason = (reason: string) => {
    setFeedback(reason);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSwap(feedback || '換一道不同做法的菜色');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">動態換一道菜</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                原本菜色：<span className="font-semibold text-slate-700 dark:text-slate-200">{currentRecipeTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                想調整什麼方向或避開什麼？
              </label>
            </div>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="例：這次想喝湯、不想加蔥和大蒜、改用微波爐..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none transition-colors"
            />
          </div>

          {/* Quick Reasons */}
          <div>
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              快速點選常用換菜理由：
            </span>
            <div className="space-y-1.5">
              {SWAP_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => handleSelectQuickReason(reason)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors border ${
                    feedback === reason
                      ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 font-medium'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSwapping}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-75"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSwapping ? 'animate-spin' : ''}`} />
              <span>{isSwapping ? '重新構思菜色中...' : '重新生成換一道'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
