import React, { useState } from 'react';
import { X, Check, Utensils, Flame, Clock } from 'lucide-react';
import { UserPreferences } from '../types';
import {
  AVAILABLE_EQUIPMENT,
  DIETARY_OPTIONS,
  COOKING_TIME_OPTIONS,
} from '../data/mockData';

interface PreferencesModalProps {
  preferences: UserPreferences;
  onSave: (prefs: UserPreferences) => void;
  onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  preferences,
  onSave,
  onClose,
}) => {
  const [recipeMode, setRecipeMode] = useState<'single' | 'combo'>(preferences.recipeMode || 'combo');
  const [equipment, setEquipment] = useState<string[]>(preferences.equipment);
  const [dietary, setDietary] = useState<string[]>(preferences.dietary);
  const [maxTimeMinutes, setMaxTimeMinutes] = useState<number>(preferences.maxTimeMinutes);

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleDietary = (item: string) => {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSave = () => {
    onSave({
      equipment,
      dietary,
      maxTimeMinutes,
      defaultServings: preferences.defaultServings || 1,
      recipeMode,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">烹飪偏好與廚房設定</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">自訂常用設備與飲食風格，每次生成食譜自動套用</p>
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Section 0: Default Recipe Mode */}
          <div>
            <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
              預設推薦生成模式
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setRecipeMode('combo')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                  recipeMode === 'combo'
                    ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🍱 一湯兩菜 / 套餐組合
              </button>
              <button
                type="button"
                onClick={() => setRecipeMode('single')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                  recipeMode === 'single'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🍲 單道特色快煮
              </button>
            </div>
          </div>

          {/* Section 1: Equipment */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <label className="font-semibold text-slate-800 dark:text-slate-200">廚房常備烹飪設備</label>
              <span className="text-xs text-slate-400 dark:text-slate-500">(可多選)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_EQUIPMENT.map((item) => {
                const isSelected = equipment.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleEquipment(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Dietary */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Utensils className="w-4 h-4 text-emerald-500" />
              <label className="font-semibold text-slate-800 dark:text-slate-200">個人飲食風格與禁忌</label>
              <span className="text-xs text-slate-400 dark:text-slate-500">(可多選)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((item) => {
                const isSelected = dietary.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleDietary(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Default Time */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <label className="font-semibold text-slate-800 dark:text-slate-200">平時偏好烹飪時間限制</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {COOKING_TIME_OPTIONS.map((opt) => {
                const isSelected = maxTimeMinutes === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMaxTimeMinutes(opt.value)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-transform active:scale-95"
          >
            儲存偏好設定
          </button>
        </div>
      </div>
    </div>
  );
};
