import React, { useState } from 'react';
import {
  X,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  ChefHat,
  Clock,
  ArrowRight,
  Plus,
  Loader2,
  UtensilsCrossed,
  Lightbulb,
  Check,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Flame,
  FileText,
  BookmarkCheck,
} from 'lucide-react';
import { Ingredient, UserPreferences, MenuCheckResult, IngredientCategory } from '../types';

interface MenuCheckerModalProps {
  ingredients: Ingredient[];
  preferences: UserPreferences;
  onAddMissingToShoppingList: (
    missingItems: { name: string; amount: number; unit: string; category: string; relatedDish: string }[]
  ) => void;
  onClose: () => void;
}

interface MenuPreset {
  id: string;
  title: string;
  tag: string;
  dishes: string[];
  description: string;
}

const PRESET_COMBOS: MenuPreset[] = [
  {
    id: 'preset-classic',
    title: '經典家常三菜一湯',
    tag: '熱門首選',
    dishes: ['三杯雞', '蒜炒高麗菜', '番茄炒蛋', '白菜豆腐蛤蜊湯'],
    description: '下飯鹹香與清甜時蔬，色香味俱全的經典家常桌菜',
  },
  {
    id: 'preset-fitness',
    title: '減脂增肌高蛋白餐',
    tag: '輕盈健康',
    dishes: ['香煎雞胸肉佐彩椒', '番茄豆腐蛋花湯', '清蒸青花菜'],
    description: '低脂高蛋白，清爽低卡路里，運動族與減重首選',
  },
  {
    id: 'preset-fast',
    title: '15分鐘極速快手晚餐',
    tag: '上班族救星',
    dishes: ['洋蔥炒蛋', '日式照燒板豆腐', '快煮蔬菜味噌湯'],
    description: '食材簡單免繁複備料，一鍋到底15分鐘開飯',
  },
  {
    id: 'preset-pot',
    title: '暖心豆腐海鮮風味餐',
    tag: '暖胃鍋物',
    dishes: ['韓式泡菜海鮮豆腐鍋', '蒜香蛤蜊絲瓜', '清炒時令時蔬'],
    description: '熱騰騰海味湯底配爽脆蔬菜，暖身又過癮',
  },
];

const QUICK_DISH_SUGGESTIONS = [
  '三杯雞',
  '蒜炒高麗菜',
  '番茄炒蛋',
  '麻婆豆腐',
  '清蒸青花菜',
  '蒜頭蛤蜊雞湯',
  '香煎鮭魚',
  '日式馬鈴薯燉牛肉',
  '白菜豆腐湯',
  '洋蔥炒牛肉片',
];

export const MenuCheckerModal: React.FC<MenuCheckerModalProps> = ({
  ingredients,
  preferences,
  onAddMissingToShoppingList,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'custom_menu' | 'quick_single'>('custom_menu');
  const [customMenuInput, setCustomMenuInput] = useState('');
  const [singleDishInput, setSingleDishInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MenuCheckResult | null>(null);
  const [addedAllMissing, setAddedAllMissing] = useState(false);
  const [addedOptimizedMissing, setAddedOptimizedMissing] = useState(false);
  const [expandedDishIndex, setExpandedDishIndex] = useState<number | null>(null);

  const handleRunCheck = async (menuTextToUse?: string) => {
    const text =
      menuTextToUse !== undefined
        ? menuTextToUse
        : activeTab === 'custom_menu'
        ? customMenuInput
        : singleDishInput;

    if (!text.trim()) return;

    setIsLoading(true);
    setResult(null);
    setAddedAllMissing(false);
    setAddedOptimizedMissing(false);

    try {
      const res = await fetch('/api/check-menu-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customMenuText: text.trim(),
          desiredDish: text.trim(),
          ingredients,
          preferences,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '比對失敗');
      }

      const data: MenuCheckResult = await res.json();
      setResult(data);
      // Auto expand first dish if any
      if (data.dishesAnalysis && data.dishesAnalysis.length > 0) {
        setExpandedDishIndex(0);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || '比對菜單時發生錯誤，請重試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (preset: MenuPreset) => {
    const text = preset.dishes.join('、');
    setCustomMenuInput(text);
    setActiveTab('custom_menu');
    handleRunCheck(text);
  };

  const handleAddQuickDish = (dish: string) => {
    if (activeTab === 'custom_menu') {
      const trimmed = customMenuInput.trim();
      if (!trimmed) {
        setCustomMenuInput(dish);
      } else if (trimmed.includes(dish)) {
        return;
      } else {
        setCustomMenuInput(`${trimmed}、${dish}`);
      }
    } else {
      setSingleDishInput(dish);
    }
  };

  const handleAddAllMissingToShopping = () => {
    if (!result?.totalMissingIngredients || result.totalMissingIngredients.length === 0) return;
    const items = result.totalMissingIngredients.map((m) => ({
      name: m.name,
      amount: m.amount || 1,
      unit: m.unit || '份',
      category: m.category || '蔬菜',
      relatedDish: m.neededForDish || result.menuTitle,
    }));
    onAddMissingToShoppingList(items);
    setAddedAllMissing(true);
  };

  const handleAddOptimizedMissingToShopping = () => {
    if (!result?.completionPlan?.optimizedMissingIngredients) return;
    const items = result.completionPlan.optimizedMissingIngredients.map((m) => ({
      name: m.name,
      amount: m.amount || 1,
      unit: m.unit || '份',
      category: m.category || '蔬菜',
      relatedDish: result.completionPlan.planTitle,
    }));
    onAddMissingToShoppingList(items);
    setAddedOptimizedMissing(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
                  自定義菜單盤點 & AI 推薦補齊方案
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                  冰箱庫存 {ingredients.length} 項
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                輸入想煮的整桌菜單或單道菜，AI 立即比對缺料並提供零浪費補齊方案
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Tabs: Custom Menu vs Single Dish */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('custom_menu')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeTab === 'custom_menu'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>自定義整桌菜單（多道菜）</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quick_single')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeTab === 'quick_single'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>單道菜色快速比對</span>
            </button>
          </div>

          {/* Input Box Area */}
          <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 transition-colors">
            {activeTab === 'custom_menu' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>請輸入自定義菜單（多道料理名稱，可用頓號、逗號或換行隔開）：</span>
                  </label>
                  {customMenuInput && (
                    <button
                      type="button"
                      onClick={() => setCustomMenuInput('')}
                      className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      清空
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  placeholder="例如：三杯雞、蒜炒高麗菜、番茄蛋花湯、蛤蜊絲瓜..."
                  value={customMenuInput}
                  onChange={(e) => setCustomMenuInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium resize-none leading-relaxed"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>輸入您想煮的特定料理名稱：</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="輸入菜名，如：經典番茄肉醬義大利麵、日式馬鈴薯燉肉..."
                    value={singleDishInput}
                    onChange={(e) => setSingleDishInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunCheck()}
                    className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* Quick Suggestions Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">快捷點選加入：</span>
              {QUICK_DISH_SUGGESTIONS.map((dish) => (
                <button
                  key={dish}
                  type="button"
                  onClick={() => handleAddQuickDish(dish)}
                  className="px-2 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] rounded-lg transition-colors flex items-center gap-1 active:scale-95"
                >
                  <Plus className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                  <span>{dish}</span>
                </button>
              ))}
            </div>

            {/* Trigger Button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                disabled={
                  isLoading ||
                  (activeTab === 'custom_menu' ? !customMenuInput.trim() : !singleDishInput.trim())
                }
                onClick={() => handleRunCheck()}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI 正在比對庫存與計算補齊方案...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>立即比對現有庫存 & 產出補齊方案</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Preset Combos when no results yet */}
          {!result && !isLoading && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>沒有靈感？一鍵套用經典推薦菜單組合：</span>
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">點擊即刻智能試算</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_COMBOS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group text-left relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-800 dark:text-white text-xs group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {preset.title}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800/60">
                        {preset.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-1">
                      {preset.dishes.join(' · ')}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                      {preset.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-12 text-center space-y-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl border border-amber-100/80 dark:border-amber-900/40">
              <Loader2 className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                AI 正在為您逐項比對冰箱中的 {ingredients.length} 項食材...
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                比對現有可用食材、計算缺料清單，並為您打造零浪費、極少採買負擔的 AI 推薦補齊方案
              </p>
            </div>
          )}

          {/* Comparison Results */}
          {result && !isLoading && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* 1. Header Overview & Match Rate Card */}
              <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-5 shadow-lg space-y-4 border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      自定義菜單比對結果
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-0.5">
                      {result.menuTitle}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-xl font-black text-white">
                          {result.overallMatchRate}%
                        </span>
                        <span className="text-xs text-slate-400">庫存就緒</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {result.overallMatchRate >= 80
                          ? '🎉 庫存非常充足，大部分食材備齊！'
                          : result.overallMatchRate >= 50
                          ? '⚡ 部分備齊，僅需補充少數食材'
                          : '🛒 缺少較多食材，建議參考下方補齊方案'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        result.overallMatchRate >= 80
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : result.overallMatchRate >= 50
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-rose-500 to-amber-500'
                      }`}
                      style={{ width: `${Math.max(5, result.overallMatchRate)}%` }}
                    />
                  </div>
                </div>

                {/* In Stock vs Missing Overview Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* IN STOCK */}
                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>冰箱現有可用食材 ({result.totalInStockIngredients?.length || 0})</span>
                      </span>
                    </div>
                    {(!result.totalInStockIngredients || result.totalInStockIngredients.length === 0) ? (
                      <p className="text-[11px] text-slate-400">目前冰箱沒有直接吻合的食材</p>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                        {result.totalInStockIngredients.map((item, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-emerald-950/70 text-emerald-300 border border-emerald-800/50 rounded-md text-[11px] font-medium"
                          >
                            {item.name} ({item.amount} {item.unit})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* MISSING INGREDIENTS */}
                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>尚缺少待採買食材 ({result.totalMissingIngredients?.length || 0})</span>
                      </span>
                    </div>
                    {(!result.totalMissingIngredients || result.totalMissingIngredients.length === 0) ? (
                      <p className="text-[11px] text-emerald-400 font-bold">
                        太棒了！所有料理食材全數齊全，可立即開煮！
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                          {result.totalMissingIngredients.map((item, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-amber-950/70 text-amber-300 border border-amber-800/60 rounded-md text-[11px] font-medium"
                              title={`用於：${item.neededForDish}`}
                            >
                              {item.name} ({item.amount} {item.unit})
                              <span className="text-[9px] text-amber-400/80 ml-1">
                                [{item.neededForDish || '菜餚'}]
                              </span>
                            </span>
                          ))}
                        </div>

                        {/* Button: Add all missing to shopping list */}
                        <button
                          type="button"
                          onClick={handleAddAllMissingToShopping}
                          disabled={addedAllMissing}
                          className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                            addedAllMissing
                              ? 'bg-emerald-600 text-white cursor-default'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-98'
                          }`}
                        >
                          {addedAllMissing ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>已全數加入採買清單</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>一鍵將所有缺料 ({result.totalMissingIngredients.length} 項) 加入採買清單</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Per-Dish Analysis Breakdown */}
              {result.dishesAnalysis && result.dishesAnalysis.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      <span>自定義菜單逐道菜色庫存剖析 ({result.dishesAnalysis.length} 道)</span>
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">點擊可展開檢視每道細節</span>
                  </div>

                  <div className="space-y-2">
                    {result.dishesAnalysis.map((dish, idx) => {
                      const isExpanded = expandedDishIndex === idx;
                      const isFullyReady = (!dish.missing || dish.missing.length === 0);

                      return (
                        <div
                          key={idx}
                          className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all bg-slate-50/50 dark:bg-slate-800/40"
                        >
                          <div
                            onClick={() => setExpandedDishIndex(isExpanded ? null : idx)}
                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                                {dish.dishName}
                              </span>
                              {isFullyReady ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>庫存食材全齊</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  <span>缺 {dish.missing.length} 項食材</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                              <span className="text-[10px]">
                                現有 {dish.inStock?.length || 0} 項
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-3 pb-3 pt-1 border-t border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-850 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              {/* Dish In-stock */}
                              <div className="p-2 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                                <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                                  ✓ 現有可用食材：
                                </span>
                                {dish.inStock && dish.inStock.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {dish.inStock.map((ing, i) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.5 bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 text-[10px]"
                                      >
                                        {ing}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">無直接現成食材</span>
                                )}
                              </div>

                              {/* Dish Missing */}
                              <div className="p-2 bg-amber-50/60 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-900/40">
                                <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                                  ! 尚需採買或補足：
                                </span>
                                {dish.missing && dish.missing.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {dish.missing.map((ing, i) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.5 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800 text-[10px]"
                                      >
                                        {ing}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                                    全部備齊，免額外採買
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. AI Recommended Completion Plan (AI 推薦補齊菜單方案) */}
              {result.completionPlan && (
                <div className="bg-gradient-to-br from-emerald-500/10 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 rounded-2xl border-2 border-emerald-300/80 dark:border-emerald-700/80 p-5 space-y-4 shadow-sm relative overflow-hidden transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                          AI 推薦補齊菜單方案 · 零浪費最大化
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {result.completionPlan.planTitle || '現有庫存最大化補齊方案'}
                        </h4>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-xs shrink-0">
                      極低採買負擔
                    </span>
                  </div>

                  {/* Strategy Summary */}
                  <div className="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>主廚調配巧思與省錢策略：</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {result.completionPlan.strategySummary}
                    </p>
                  </div>

                  {/* Optimized Recommended Dishes */}
                  {result.completionPlan.optimizedDishes &&
                    result.completionPlan.optimizedDishes.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block">
                          🍽️ 補齊調整後的建議菜單 ({result.completionPlan.optimizedDishes.length} 道)：
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {result.completionPlan.optimizedDishes.map((dish, i) => (
                            <div
                              key={i}
                              className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-2xs space-y-1.5 text-[11px]"
                            >
                              <div className="flex items-center justify-between">
                                <h5 className="font-extrabold text-slate-900 dark:text-white">
                                  {dish.dishTitle}
                                </h5>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                  <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                  <span>{dish.cookingTimeMinutes || 20} 分</span>
                                </div>
                              </div>
                              <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50">
                                {dish.dishType || '主菜'}
                              </span>
                              <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                                {dish.description}
                              </p>
                              {dish.whyChanged && (
                                <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50/80 dark:bg-emerald-950/50 p-1.5 rounded-lg border border-emerald-100/60 dark:border-emerald-900/50">
                                  💡 <b>調配亮點：</b>{dish.whyChanged}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Minimal Missing Ingredients for this Optimized Plan */}
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                        採用此補齊方案後的極簡採買：
                      </span>
                      {(!result.completionPlan.optimizedMissingIngredients ||
                        result.completionPlan.optimizedMissingIngredients.length === 0) ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                          🎉 零額外採買負擔！完全可利用現有冰箱庫存全數料理！
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.completionPlan.optimizedMissingIngredients.map((ing, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-medium rounded border border-emerald-200 dark:border-emerald-800 text-[10px]"
                            >
                              {ing.name} ({ing.amount} {ing.unit})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {result.completionPlan.optimizedMissingIngredients &&
                      result.completionPlan.optimizedMissingIngredients.length > 0 && (
                        <button
                          type="button"
                          onClick={handleAddOptimizedMissingToShopping}
                          disabled={addedOptimizedMissing}
                          className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-xs ${
                            addedOptimizedMissing
                              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                              : 'bg-emerald-700 hover:bg-emerald-600 text-white active:scale-95'
                          }`}
                        >
                          {addedOptimizedMissing ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>已加入採買清單</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>加入極簡缺料 ({result.completionPlan.optimizedMissingIngredients.length} 項)</span>
                            </>
                          )}
                        </button>
                      )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 transition-colors">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            冰箱庫存登錄 <b>{ingredients.length}</b> 項 · 隨時自定義任何菜單進行缺料比對
          </span>
          <div className="flex items-center gap-2">
            {result && (
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setAddedAllMissing(false);
                  setAddedOptimizedMissing(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                重新輸入
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-xl transition-transform active:scale-95 shadow-xs"
            >
              完成關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
