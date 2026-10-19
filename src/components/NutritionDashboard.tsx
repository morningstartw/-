import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Sparkles,
} from 'lucide-react';
import { Ingredient } from '../types';

interface NutritionDashboardProps {
  ingredients: Ingredient[];
  onFilterExpiring: () => void;
}

export const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  ingredients,
  onFilterExpiring,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Expiring items
  const expiringItems = ingredients.filter(
    (item) => item.expiryDays !== undefined && item.expiryDays <= 3
  );

  // Calculate total estimated nutritional density from available fridge inventory
  const totalWeightEstimate = ingredients.reduce((sum, item) => sum + item.amount, 0);
  const vegCount = ingredients.filter((i) => i.category === '蔬菜').length;
  const meatCount = ingredients.filter((i) => i.category === '肉類' || i.category === '海鮮').length;
  const proteinCount = ingredients.filter(
    (i) => i.category === '肉類' || i.category === '蛋奶豆' || i.category === '海鮮'
  ).length;

  // Zero-waste score calculation (100 minus penalty for expiring items)
  const wasteScore = Math.max(
    60,
    Math.min(100, Math.round(100 - (expiringItems.length / (ingredients.length || 1)) * 40))
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs transition-all">
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                健康營養與即期品儀表板
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                零浪費指數 {wasteScore}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {expiringItems.length > 0 ? (
                <span className="text-amber-700 dark:text-amber-400 font-medium">
                  ⚠️ 有 {expiringItems.length} 項食材即將到期（3天內），建議優先料理！
                </span>
              ) : (
                <span>食材狀態優良，無急迫過期風險</span>
              )}
            </p>
          </div>
        </div>

        <button className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-1">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Dashboard Body */}
      {isExpanded && (
        <div className="p-4 space-y-4 text-xs">
          {/* Urgent Expiring Alert Banner if any */}
          {expiringItems.length > 0 && (
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-amber-900 dark:text-amber-200 block truncate">
                    即期警示：{expiringItems.map((i) => `${i.name} (${i.expiryDays}天)`).join('、')}
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">
                    點擊可快速於食譜條件中指定優先消耗！
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onFilterExpiring}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[11px] shrink-0 transition-colors shadow-2xs"
              >
                優先消滅
              </button>
            </div>
          )}

          {/* Macro Nutrient & Inventory Balance Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Calories / General Energy */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                <span className="flex items-center gap-1 font-medium">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  估計熱量儲備
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  ~{Math.round(totalWeightEstimate * 140)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">kcal</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[65%]" />
              </div>
            </div>

            {/* Protein Sources */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                <span className="flex items-center gap-1 font-medium">
                  <Dumbbell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  蛋白質食材
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-emerald-800 dark:text-emerald-300 tabular-nums">
                  {proteinCount}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">品項 (肉蛋豆)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${Math.min(100, proteinCount * 25)}%` }}
                />
              </div>
            </div>

            {/* Fiber / Vegetables */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                <span className="flex items-center gap-1 font-medium">
                  <Wheat className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  時蔬纖維
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-teal-800 dark:text-teal-300 tabular-nums">
                  {vegCount}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">種蔬菜</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full"
                  style={{ width: `${Math.min(100, vegCount * 20)}%` }}
                />
              </div>
            </div>

            {/* Healthy Fat & Ratio */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                <span className="flex items-center gap-1 font-medium">
                  <Droplet className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  葷素配比
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {vegCount}:{meatCount || 1}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">綠色比例</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[70%]" />
              </div>
            </div>
          </div>

          {/* Quick Dietary Advice */}
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl text-emerald-900 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <b>飲食均衡提示：</b>
              {vegCount >= 3 && proteinCount >= 2
                ? '目前冰箱蔬菜與蛋白質庫存充裕，非常適合製作一湯兩菜的均衡套餐！'
                : '建議可在採買時多補進 1~2 種綠色蔬菜或優質蛋白質（如嫩豆腐或雞蛋），讓餐點更營養。'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
