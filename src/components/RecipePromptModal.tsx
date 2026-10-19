import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Utensils,
  Clock,
  MessageSquare,
  Check,
  Package,
} from 'lucide-react';
import { Ingredient, UserPreferences } from '../types';
import {
  AVAILABLE_EQUIPMENT,
  DIETARY_OPTIONS,
  COOKING_TIME_OPTIONS,
  QUICK_NOTE_SUGGESTIONS,
} from '../data/mockData';

interface RecipePromptModalProps {
  ingredients: Ingredient[];
  initialPreferences: UserPreferences;
  isGenerating: boolean;
  onGenerate: (params: {
    equipment: string[];
    dietary: string[];
    maxTimeMinutes: number;
    extraNotes: string;
    saveAsDefault: boolean;
    mode: 'single' | 'combo';
  }) => void;
  onClose: () => void;
}

export const RecipePromptModal: React.FC<RecipePromptModalProps> = ({
  ingredients,
  initialPreferences,
  isGenerating,
  onGenerate,
  onClose,
}) => {
  const [mode, setMode] = useState<'single' | 'combo'>(initialPreferences.recipeMode || 'combo');
  const [equipment, setEquipment] = useState<string[]>(initialPreferences.equipment);
  const [dietary, setDietary] = useState<string[]>(initialPreferences.dietary);
  const [maxTimeMinutes, setMaxTimeMinutes] = useState<number>(initialPreferences.maxTimeMinutes);
  const [extraNotes, setExtraNotes] = useState<string>('');
  const [saveAsDefault, setSaveAsDefault] = useState<boolean>(false);

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

  const handleQuickNote = (note: string) => {
    setExtraNotes((prev) => {
      if (!prev) return note;
      if (prev.includes(note)) return prev;
      return `${prev}、${note}`;
    });
  };

  const handleStartGenerate = () => {
    onGenerate({
      equipment: equipment.length > 0 ? equipment : ['平底鍋'],
      dietary,
      maxTimeMinutes,
      extraNotes,
      saveAsDefault,
      mode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 duration-300 transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">客製化食譜條件設定</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">依據現有庫存與設備，打造零浪費個人化菜單</p>
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
        <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {/* Recommendation Mode: Combo vs Single */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              推薦產出模式
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('combo')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                  mode === 'combo'
                    ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🍱 一湯兩菜 / 均衡套餐 (Combo)
              </button>
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                  mode === 'single'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🍲 單道特色料理 (Single)
              </button>
            </div>
          </div>

          {/* Current Fridge Summary Pill */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                將使用冰箱中 <b>{ingredients.length}</b> 項可用食材進行配對
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">零浪費優先</span>
          </div>

          {/* Section 1: Equipment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">可用烹飪設備 (Equipment)</span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">已選 {equipment.length} 種</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_EQUIPMENT.map((item) => {
                const selected = equipment.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleEquipment(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border ${
                      selected
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Dietary Style */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">飲食風格與禁忌 (Dietary)</span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">已選 {dietary.length} 種</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((item) => {
                const selected = dietary.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleDietary(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border ${
                      selected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Time Limit */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">時間限制 (Cooking Time)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {COOKING_TIME_OPTIONS.map((opt) => {
                const selected = maxTimeMinutes === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMaxTimeMinutes(opt.value)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Extra requirements */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">額外指令或想吃的感覺 (可選)</span>
            </div>
            <input
              type="text"
              placeholder="還想補充什麼嗎？(例如：想喝熱湯、清冰箱即期食材、不要辣...)"
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs mb-2"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_NOTE_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleQuickNote(sug)}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] rounded-md transition-colors"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Checkbox: Save as default */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                記住此次設定為全局預設值 (儲存至個人檔案)
              </span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleStartGenerate}
            className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'AI 大廚構思食譜中...' : '✨ 魔法生成食譜'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
