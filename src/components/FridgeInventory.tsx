import React, { useState } from 'react';
import {
  Camera,
  Plus,
  Search,
  LayoutGrid,
  List,
  Trash2,
  AlertTriangle,
  Sparkles,
  Package,
  Calendar,
  ChefHat,
} from 'lucide-react';
import { Ingredient, IngredientCategory } from '../types';
import { NutritionDashboard } from './NutritionDashboard';

interface FridgeInventoryProps {
  ingredients: Ingredient[];
  onUpdateAmount: (id: string, delta: number) => void;
  onDeleteIngredient: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenRecognitionModal: () => void;
  onOpenRecipePromptBuilder: () => void;
  onOpenMenuChecker?: () => void;
}

const CATEGORY_TABS: (IngredientCategory | '全部')[] = [
  '全部',
  '蔬菜',
  '肉類',
  '海鮮',
  '蛋奶豆',
  '水果',
  '主食澱粉',
  '調味醬料',
  '其他',
];

export const FridgeInventory: React.FC<FridgeInventoryProps> = ({
  ingredients,
  onUpdateAmount,
  onDeleteIngredient,
  onOpenAddModal,
  onOpenRecognitionModal,
  onOpenRecipePromptBuilder,
  onOpenMenuChecker,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | '全部'>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtered ingredients
  const filteredIngredients = ingredients.filter((item) => {
    const matchesCategory =
      selectedCategory === '全部' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  // Expiring soon items (<= 3 days)
  const expiringCount = ingredients.filter(
    (item) => item.expiryDays !== undefined && item.expiryDays <= 3
  ).length;

  return (
    <div className="space-y-4 pb-28 relative">
      {/* Top Overview Stats Card */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 dark:from-emerald-900 dark:via-teal-900 dark:to-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden border border-emerald-600/30">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-emerald-200 dark:text-emerald-400 text-xs font-semibold tracking-wide uppercase">
              零浪費智慧庫存管家
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">我的智慧冰箱</h1>
            <p className="text-xs text-emerald-100/80 dark:text-emerald-300/80">
              目前登錄 {ingredients.length} 項食材
              {expiringCount > 0 && ` · 其中 ${expiringCount} 項即將到期建議優先消耗`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1.5 border border-white/15 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>手動新增</span>
            </button>
            <button
              type="button"
              onClick={onOpenRecipePromptBuilder}
              className="px-4 py-2 bg-white text-emerald-900 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-50 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>依庫存推薦食譜</span>
            </button>
          </div>
        </div>

        {/* Background decorative circles */}
        <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      </div>

      {/* Expiry Alerts & Macronutrient Health Dashboard */}
      <NutritionDashboard
        ingredients={ingredients}
        onFilterExpiring={onOpenRecipePromptBuilder}
      />

      {/* Custom Menu Shortage Checker Banner */}
      {onOpenMenuChecker && (
        <div
          onClick={onOpenMenuChecker}
          className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-amber-950 dark:text-amber-200 block">
                自定義菜單缺料盤點 & AI 推薦補齊方案
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 block">
                輸入想煮的整桌料理或單道菜，AI 立即比對缺料並提供零浪費推薦補齊方案
              </span>
            </div>
          </div>
          <span className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shrink-0 transition-colors shadow-2xs">
            盤點菜單
          </span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="搜尋冰箱中的食材（例如：番茄、雞肉...）"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs transition-colors"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl transition-colors">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="網格檢視"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="列表檢視"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Tabs (Horizontal Scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Ingredients Grid / List */}
      {filteredIngredients.length === 0 ? (
        <div className="py-14 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 transition-colors">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {searchQuery ? '沒有找到相符的食材' : '目前分類尚無食材'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              點擊右下角相機拍照辨識，或上方「手動新增」放入食材！
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenRecognitionModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-transform active:scale-95 shadow-2xs"
          >
            <Camera className="w-4 h-4" />
            <span>拍照一鍵盤點</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredIngredients.map((item) => {
            const isExpiring = item.expiryDays !== undefined && item.expiryDays <= 3;
            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 ${
                  isExpiring
                    ? 'border-amber-300 dark:border-amber-600/80 ring-1 ring-amber-200/50 dark:ring-amber-900/50'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Top: Category & Expiry Warning */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  {isExpiring && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {item.expiryDays} 天到期
                    </span>
                  )}
                </div>

                {/* Name */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>入庫 {new Date(item.addedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Bottom: Stepper & Delete */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onUpdateAmount(item.id, -1)}
                      className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-2 py-1 text-xs font-bold text-slate-900 dark:text-white min-w-[36px] text-center">
                      {item.amount}
                      <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 ml-0.5">
                        {item.unit}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateAmount(item.id, 1)}
                      className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteIngredient(item.id)}
                    className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                    title="刪除食材"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-2xs transition-colors">
          {filteredIngredients.map((item) => {
            const isExpiring = item.expiryDays !== undefined && item.expiryDays <= 3;
            return (
              <div
                key={item.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md shrink-0">
                    {item.category}
                  </span>
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    {isExpiring && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        建議 {item.expiryDays} 天內吃完
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onUpdateAmount(item.id, -1)}
                      className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white min-w-[50px] text-center">
                      {item.amount} {item.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateAmount(item.id, 1)}
                      className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteIngredient(item.id)}
                    className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                    title="刪除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prominent FAB (Floating Action Button) on Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={onOpenRecognitionModal}
          className="group flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95"
          aria-label="新增食材 / 拍照盤點"
        >
          <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-wide">📸 新增食材 / 盤點</span>
        </button>
      </div>
    </div>
  );
};
