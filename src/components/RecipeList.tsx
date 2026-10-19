import React from 'react';
import {
  Clock,
  Flame,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  Layers,
  CalendarPlus,
} from 'lucide-react';
import { Recipe, RecipeCombo } from '../types';

interface RecipeListProps {
  recipes: Recipe[];
  combo?: RecipeCombo | null;
  onSelectRecipe: (recipe: Recipe) => void;
  onSelectCombo?: (combo: RecipeCombo) => void;
  onOpenPromptBuilder: () => void;
  onRequestSwap: (recipe: Recipe) => void;
  onAddToPlanner?: (recipe: Recipe) => void;
}

export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  combo,
  onSelectRecipe,
  onSelectCombo,
  onOpenPromptBuilder,
  onRequestSwap,
  onAddToPlanner,
}) => {
  return (
    <div className="space-y-5 pb-20">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            AI 智能推薦零浪費食譜
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            精準根據當前冰箱庫存與偏好計算，極致消耗現有食材
          </p>
        </div>
        <button
          onClick={onOpenPromptBuilder}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors shadow-2xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>調整條件</span>
        </button>
      </div>

      {/* Featured Combo Card (一湯兩菜 / 套餐組合) if exists */}
      {combo && (
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 dark:from-emerald-950 dark:via-teal-950 dark:to-slate-950 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden border border-emerald-500/30">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-emerald-400" />
                AI 推薦一湯兩菜均衡套餐
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                消耗 {combo.matchPercentage}% 庫存
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {combo.comboTitle}
              </h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                {combo.description}
              </p>
            </div>

            {/* Dishes in this combo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {combo.dishes.map((dish, i) => (
                <div
                  key={dish.id || i}
                  onClick={() => onSelectRecipe(dish)}
                  className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 cursor-pointer transition-colors space-y-1"
                >
                  <span className="text-[10px] text-emerald-300 font-semibold block">
                    {dish.dishType || `菜色 0${i + 1}`}
                  </span>
                  <span className="font-bold text-xs text-white block truncate">
                    {dish.title}
                  </span>
                  <span className="text-[10px] text-slate-300 block">
                    {dish.cookingTimeMinutes} 分鐘 · {dish.nutrition.calories} kcal
                  </span>
                </div>
              ))}
            </div>

            {/* Sequence tip & Action */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-[11px] text-emerald-200">
                💡 <b>平行料理秘訣：</b> {combo.cookingSequenceTips}
              </span>
              {onSelectCombo && (
                <button
                  type="button"
                  onClick={() => onSelectCombo(combo)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition-transform active:scale-95 shrink-0 shadow-md"
                >
                  開始整套料理
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Individual Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Image & Match Badge */}
            <div
              className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
              onClick={() => onSelectRecipe(recipe)}
            >
              <img
                src={
                  recipe.imageUrl ||
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
                }
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              {/* Match Badge */}
              <div className="absolute top-3 right-3 bg-emerald-600/95 backdrop-blur-xs text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>消耗 {recipe.matchPercentage}% 庫存</span>
              </div>

              {/* Dish Type / Time Tag on Bottom */}
              <div className="absolute bottom-3 left-3 text-white flex items-center gap-2 text-xs font-semibold">
                <span className="bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {recipe.cookingTimeMinutes} 分鐘
                </span>
                <span className="bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {recipe.difficulty}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3
                  onClick={() => onSelectRecipe(recipe)}
                  className="font-bold text-slate-800 dark:text-slate-100 text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {recipe.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {recipe.description}
                </p>
              </div>

              {/* Used Ingredients Chips */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>用掉冰箱庫存：</span>
                  <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                    <Flame className="w-3 h-3 text-amber-500" />
                    {recipe.equipmentUsed.join(', ')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {recipe.usedIngredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium rounded-md border border-emerald-100 dark:border-emerald-800/60"
                    >
                      {ing.name} ({ing.amount} {ing.unit})
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRequestSwap(recipe)}
                  className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
                  title="換一道"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {onAddToPlanner && (
                  <button
                    type="button"
                    onClick={() => onAddToPlanner(recipe)}
                    className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
                    title="排入週菜單"
                  >
                    <CalendarPlus className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSelectRecipe(recipe)}
                  className="flex-1 py-2.5 px-3 bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs"
                >
                  <span>查看步驟與開煮</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
