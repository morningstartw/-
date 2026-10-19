import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Flame,
  ChefHat,
  AlertCircle,
  Layers,
} from 'lucide-react';
import {
  WeeklyMealSlot,
  Recipe,
  RecipeCombo,
  Ingredient,
  DayName,
  MealType,
  ShoppingItem,
} from '../types';

interface WeeklyPlannerProps {
  slots: WeeklyMealSlot[];
  ingredients: Ingredient[];
  recipes: Recipe[];
  onUpdateSlot: (slotId: string, recipe?: Recipe, combo?: RecipeCombo) => void;
  onClearSlot: (slotId: string) => void;
  onToggleCooked: (slotId: string) => void;
  onGenerateAIPlan: () => Promise<void>;
  isGeneratingPlan: boolean;
  onOpenShoppingList: () => void;
  shoppingListCount: number;
  onSelectRecipeDetail: (recipe: Recipe) => void;
}

const DAYS: DayName[] = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  slots,
  ingredients,
  recipes,
  onUpdateSlot,
  onClearSlot,
  onToggleCooked,
  onGenerateAIPlan,
  isGeneratingPlan,
  onOpenShoppingList,
  shoppingListCount,
  onSelectRecipeDetail,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayName>('週一');
  const [assigningSlotId, setAssigningSlotId] = useState<string | null>(null);

  // Check inventory shortage for a recipe
  const checkShortage = (recipe?: Recipe) => {
    if (!recipe) return { isReady: true, missingCount: 0 };
    let missingCount = 0;
    recipe.usedIngredients.forEach((used) => {
      const match = ingredients.find(
        (i) => i.name.toLowerCase() === used.name.toLowerCase() && i.amount >= used.amount
      );
      if (!match) missingCount++;
    });
    return { isReady: missingCount === 0, missingCount };
  };

  // Planned count
  const plannedCount = slots.filter((s) => s.recipe || s.combo).length;

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner & AI Action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-2xl p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-700/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">全週菜單智能規劃</h2>
          </div>
          <p className="text-xs text-slate-300">
            預先排定週一至週日午晚餐，系統自動比對庫存缺額並產出採買清單
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenShoppingList}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1.5 border border-white/15 active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
            <span>採購清單 ({shoppingListCount})</span>
          </button>

          <button
            type="button"
            disabled={isGeneratingPlan}
            onClick={onGenerateAIPlan}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-75 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingPlan ? 'animate-spin' : ''}`} />
            <span>{isGeneratingPlan ? 'AI 排程運算中...' : '✨ AI 自動生成全週菜單'}</span>
          </button>
        </div>
      </div>

      {/* Week Day Switcher Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {DAYS.map((day) => {
          const daySlots = slots.filter((s) => s.day === day);
          const hasMeals = daySlots.some((s) => s.recipe || s.combo);
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center border relative ${
                isSelected
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{day}</span>
              {hasMeals && (
                <span
                  className={`block w-1.5 h-1.5 rounded-full mx-auto mt-1 ${
                    isSelected ? 'bg-emerald-400' : 'bg-emerald-600 dark:bg-emerald-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Slots: Lunch & Dinner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['午餐', '晚餐'] as MealType[]).map((mealType) => {
          const slot = slots.find((s) => s.day === selectedDay && s.mealType === mealType);
          if (!slot) return null;

          const activeMeal = slot.recipe || slot.combo?.dishes[0];
          const shortageInfo = checkShortage(activeMeal);

          return (
            <div
              key={mealType}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-2xs space-y-3 transition-all ${
                slot.isCooked
                  ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : slot.recipe || slot.combo
                  ? 'border-slate-300 dark:border-slate-750'
                  : 'border-dashed border-slate-300 dark:border-slate-700'
              }`}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {selectedDay} · {mealType}
                  </span>
                  {slot.isCooked && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                      已完成料理
                    </span>
                  )}
                  {slot.combo && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 flex items-center gap-1 border border-purple-200/50 dark:border-purple-800/50">
                      <Layers className="w-3 h-3" />
                      套餐組合
                    </span>
                  )}
                </div>

                {slot.recipe || slot.combo ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleCooked(slot.id)}
                      className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ${
                        slot.isCooked
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 font-bold'
                          : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={slot.isCooked ? '取消標記' : '標記為已煮過'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[11px] hidden sm:inline">
                        {slot.isCooked ? '已煮' : '標記完畢'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onClearSlot(slot.id)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                      title="清除此餐排程"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Slot Content */}
              {slot.recipe || slot.combo ? (
                <div className="space-y-3">
                  <div
                    onClick={() => slot.recipe && onSelectRecipeDetail(slot.recipe)}
                    className="p-3 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100/70 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {slot.combo ? slot.combo.comboTitle : slot.recipe?.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {slot.combo ? slot.combo.description : slot.recipe?.description}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {slot.combo
                          ? `${slot.combo.totalCookingTimeMinutes} 分鐘`
                          : `${slot.recipe?.cookingTimeMinutes} 分鐘`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-rose-500" />
                        {slot.combo
                          ? `${slot.combo.combinedNutrition.calories} kcal`
                          : `${slot.recipe?.nutrition.calories} kcal`}
                      </span>
                    </div>

                    {/* Combo dishes pill list if combo */}
                    {slot.combo && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {slot.combo.dishes.map((dish, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            {dish.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Shortage indicator */}
                  <div className="flex items-center justify-between text-xs">
                    {shortageInfo.isReady ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        冰箱庫存完全就緒
                      </span>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        缺少 {shortageInfo.missingCount} 項食材 (已彙整至採買清單)
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setAssigningSlotId(slot.id)}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline"
                    >
                      更換菜色
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Slot Placeholder */
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">尚未安排料理</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">點擊下方按鈕自選或由 AI 推薦</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssigningSlotId(slot.id)}
                    className="px-3.5 py-1.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>安排菜色</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recipe Picker Modal for Slot Assignment */}
      {assigningSlotId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">選擇要排入此餐期的食譜</h3>
              <button
                onClick={() => setAssigningSlotId(null)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xs"
              >
                取消
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recipes.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    onUpdateSlot(assigningSlotId, r);
                    setAssigningSlotId(null);
                  }}
                  className="pt-2 pb-2 first:pt-0 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 p-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{r.title}</h5>
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                      {r.cookingTimeMinutes} 分鐘 · {r.nutrition.calories} kcal · {r.dishType}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px]"
                  >
                    排入
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
