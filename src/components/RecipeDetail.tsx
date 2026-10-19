import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Flame,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Utensils,
  Lightbulb,
  Share2,
  PackageCheck,
  ChefHat,
  Check,
} from 'lucide-react';
import { Recipe, Ingredient } from '../types';

interface RecipeDetailProps {
  recipe: Recipe;
  inventory: Ingredient[];
  onBack: () => void;
  onCooked: (recipe: Recipe) => void;
  onRequestSwap: (recipe: Recipe) => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  inventory,
  onBack,
  onCooked,
  onRequestSwap,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  // Step timers state: map stepNumber -> { remainingSeconds, isRunning }
  const [timers, setTimers] = useState<{
    [stepNumber: number]: { remaining: number; running: boolean; initial: number };
  }>({});

  // Initialize timers for steps that have timerSeconds
  useEffect(() => {
    const initialTimers: {
      [stepNumber: number]: { remaining: number; running: boolean; initial: number };
    } = {};
    recipe.steps.forEach((step) => {
      if (step.timerSeconds && step.timerSeconds > 0) {
        initialTimers[step.stepNumber] = {
          remaining: step.timerSeconds,
          running: false,
          initial: step.timerSeconds,
        };
      }
    });
    setTimers(initialTimers);
  }, [recipe]);

  // Interval ticker for running timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        let hasChanges = false;
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          const stepNum = Number(key);
          const t = next[stepNum];
          if (t && t.running && t.remaining > 0) {
            hasChanges = true;
            next[stepNum] = {
              ...t,
              remaining: t.remaining - 1,
              running: t.remaining - 1 > 0,
            };
          }
        });
        return hasChanges ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  const toggleTimer = (stepNumber: number) => {
    setTimers((prev) => {
      const current = prev[stepNumber];
      if (!current) return prev;
      return {
        ...prev,
        [stepNumber]: { ...current, running: !current.running },
      };
    });
  };

  const resetTimer = (stepNumber: number) => {
    setTimers((prev) => {
      const current = prev[stepNumber];
      if (!current) return prev;
      return {
        ...prev,
        [stepNumber]: { ...current, remaining: current.initial, running: false },
      };
    });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(
    (completedSteps.length / (recipe.steps.length || 1)) * 100
  );

  return (
    <div className="pb-28 max-w-2xl mx-auto animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回食譜列表</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            消耗 {recipe.matchPercentage}% 庫存
          </span>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(
                  `🍽️ 今日料理：${recipe.title}\n耗時約 ${recipe.cookingTimeMinutes} 分鐘，利用冰箱食材做出的美味減廢食譜！`
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
            title="分享食譜"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">已複製</span>
              </>
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-56 sm:h-64 w-full bg-slate-900 overflow-hidden">
        <img
          src={
            recipe.imageUrl ||
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80'
          }
          alt={recipe.title}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-medium text-emerald-300">
            <span>{recipe.dishType || '家常料理'}</span>
            <span>·</span>
            <span>{recipe.difficulty}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {recipe.cookingTimeMinutes} 分鐘
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1 drop-shadow-sm">
            {recipe.title}
          </h1>
          <p className="text-xs text-slate-300 line-clamp-2 drop-shadow-xs">
            {recipe.description}
          </p>
        </div>
      </div>

      {/* Equipment Used Tag Bar */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 transition-colors">
        <span className="flex items-center gap-1.5 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          所需烹飪設備：
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {recipe.equipmentUsed.join('、')}
          </span>
        </span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          熱量約 {recipe.nutrition.calories} kcal
        </span>
      </div>

      <div className="p-4 space-y-6">
        {/* Ingredients Used Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                預計消耗冰箱食材 (點擊完成後扣除)
              </h2>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              共 {recipe.usedIngredients.length} 項
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recipe.usedIngredients.map((ing, idx) => {
              // check existing stock in inventory
              const inStock = inventory.find(
                (item) => item.name.toLowerCase() === ing.name.toLowerCase()
              );
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-750 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{ing.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                      消耗 {ing.amount} {ing.unit}
                    </span>
                    {inStock && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        (剩餘 {inStock.amount})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pantry Additional Ingredients */}
          {recipe.additionalIngredients && recipe.additionalIngredients.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                常用常備調味料 / 額外食材：
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recipe.additionalIngredients.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-md"
                  >
                    {item.name} ({item.amount})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Steps Checklist Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">烹飪步驟清單</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                進度 {progressPercent}%
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {recipe.steps.map((step) => {
              const isChecked = completedSteps.includes(step.stepNumber);
              const timer = timers[step.stepNumber];

              return (
                <div
                  key={step.stepNumber}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isChecked
                      ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleStep(step.stepNumber)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            isChecked
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          步驟 {step.stepNumber}. {step.title}
                        </span>
                      </div>
                      <p
                        className={`text-xs leading-relaxed ${
                          isChecked
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {step.instruction}
                      </p>

                      {/* Built-in Interactive Kitchen Timer */}
                      {timer && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>{formatTimer(timer.remaining)}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleTimer(step.stepNumber)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                              timer.running
                                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 hover:bg-amber-200'
                                : timer.remaining === 0
                                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                            }`}
                          >
                            {timer.running ? (
                              <>
                                <Pause className="w-3 h-3" />
                                <span>暫停</span>
                              </>
                            ) : timer.remaining === 0 ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>計時完成！</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                <span>開始計時</span>
                              </>
                            )}
                          </button>

                          {timer.remaining !== timer.initial && (
                            <button
                              type="button"
                              onClick={() => resetTimer(step.stepNumber)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                              title="重設計時器"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nutrition & Chef Tips Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Nutrition */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-2.5 transition-colors">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Utensils className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>營養估算 (單份)</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="block text-[10px] text-slate-400 dark:text-slate-500">熱量</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {recipe.nutrition.calories}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block">kcal</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="block text-[10px] text-slate-400 dark:text-slate-500">蛋白質</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {recipe.nutrition.protein}g
                </span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="block text-[10px] text-slate-400 dark:text-slate-500">碳水</span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  {recipe.nutrition.carbs}g
                </span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="block text-[10px] text-slate-400 dark:text-slate-500">脂肪</span>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
                  {recipe.nutrition.fat}g
                </span>
              </div>
            </div>
          </div>

          {/* Chef Tip */}
          <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 shadow-2xs space-y-1.5 transition-colors">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>大廚美味偷吃步</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              {recipe.chefTip || '烹調前確保鍋熱再下油，翻炒更具鑊氣與香氣！'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Interactive Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3 shadow-lg transition-colors">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {/* Swap Recipe Button */}
          <button
            type="button"
            onClick={() => onRequestSwap(recipe)}
            className="flex-1 sm:flex-none px-4 py-3 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>🔄 換一道</span>
          </button>

          {/* Cooked & Deduct Button */}
          <button
            type="button"
            onClick={() => onCooked(recipe)}
            className="flex-2 sm:flex-none sm:min-w-[220px] px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🍽️ 我煮完了！(扣除食材)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
