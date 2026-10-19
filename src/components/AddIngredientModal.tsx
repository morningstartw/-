import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { Ingredient, IngredientCategory } from '../types';

interface AddIngredientModalProps {
  onAdd: (ingredient: Omit<Ingredient, 'id' | 'addedAt'>) => void;
  onClose: () => void;
}

const CATEGORIES: IngredientCategory[] = [
  '蔬菜',
  '肉類',
  '海鮮',
  '蛋奶豆',
  '水果',
  '主食澱粉',
  '調味醬料',
  '其他',
];

const COMMON_UNITS = ['顆', '把', '盒', '克', '根', '包', '塊', '瓶', '份', '條', '袋', '片'];

export const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
  onAdd,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState('顆');
  const [category, setCategory] = useState<IngredientCategory>('蔬菜');
  const [expiryDays, setExpiryDays] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      amount: Math.max(0.1, Number(amount)),
      unit,
      category,
      expiryDays,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">手動新增食材</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              食材名稱 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="例：高麗菜、鮭魚菲力、洋蔥..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all text-sm"
            />
          </div>

          {/* Amount & Unit Stepper */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                數量
              </label>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAmount((prev) => Math.max(0.5, prev - (prev > 1 ? 1 : 0.5)))}
                  className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 font-bold transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 1)}
                  className="w-full text-center bg-transparent py-2 focus:outline-none font-semibold text-slate-900 dark:text-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => setAmount((prev) => prev + 1)}
                  className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                單位
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white text-sm font-medium"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u} className="dark:bg-slate-900">
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              食材分類
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-1 text-xs font-medium rounded-lg text-center border transition-all ${
                    category === cat
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Expiry Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              預計食用期限 (天數)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="30"
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0 w-12 text-right">
                {expiryDays} 天內
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>確認加入冰箱</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
