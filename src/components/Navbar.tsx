import React from 'react';
import {
  Refrigerator,
  BookOpen,
  Calendar,
  ShoppingCart,
  Settings,
  RotateCcw,
  ChefHat,
  Moon,
  Sun,
  Rocket,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'inventory' | 'weekly' | 'recipes' | 'detail';
  onSelectTab: (tab: 'inventory' | 'weekly' | 'recipes') => void;
  inventoryCount: number;
  plannedMealsCount: number;
  recipesCount: number;
  shoppingListCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenShoppingList: () => void;
  onOpenMenuChecker: () => void;
  onOpenVercelDeploy: () => void;
  onOpenSettings: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  inventoryCount,
  plannedMealsCount,
  recipesCount,
  shoppingListCount,
  isDarkMode,
  onToggleDarkMode,
  onOpenShoppingList,
  onOpenMenuChecker,
  onOpenVercelDeploy,
  onOpenSettings,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand */}
        <div
          onClick={() => onSelectTab('inventory')}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Refrigerator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                AI 智慧冰箱
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">零浪費動態食譜管家</p>
          </div>
        </div>

        {/* Center Segmented Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto scrollbar-none transition-colors">
          {/* Inventory Tab */}
          <button
            onClick={() => onSelectTab('inventory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentTab === 'inventory'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Refrigerator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">我的冰箱</span>
            <span className="sm:hidden">冰箱</span>
            <span className="ml-0.5 px-1.5 py-0.2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-full text-[10px]">
              {inventoryCount}
            </span>
          </button>

          {/* Weekly Planner Tab */}
          <button
            onClick={() => onSelectTab('weekly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentTab === 'weekly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">週菜單規劃</span>
            <span className="sm:hidden">週菜單</span>
            {plannedMealsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-full text-[10px]">
                {plannedMealsCount}
              </span>
            )}
          </button>

          {/* Recipes Tab */}
          <button
            onClick={() => onSelectTab('recipes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentTab === 'recipes' || currentTab === 'detail'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">推薦食譜</span>
            <span className="sm:hidden">食譜</span>
            <span className="ml-0.5 px-1.5 py-0.2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-full text-[10px]">
              {recipesCount}
            </span>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Vercel Cloud Deploy Button */}
          <button
            onClick={onOpenVercelDeploy}
            className="px-2.5 py-1.5 bg-black dark:bg-white text-white dark:text-slate-950 hover:opacity-90 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95"
            title="Vercel 雲端部署教學與狀態"
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            <span className="hidden lg:inline">Vercel 部署</span>
          </button>

          {/* Menu Checker Button */}
          <button
            onClick={onOpenMenuChecker}
            className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95"
            title="自訂菜單缺料盤點 & AI 推薦"
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden md:inline">菜單缺料盤點</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90"
            title={isDarkMode ? '切換為淺色模式' : '切換為深色模式'}
            aria-label={isDarkMode ? '切換為淺色模式' : '切換為深色模式'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Shopping List Button */}
          <button
            onClick={onOpenShoppingList}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative active:scale-95"
            title="缺料採購清單"
          >
            <ShoppingCart className="w-4 h-4" />
            {shoppingListCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {shoppingListCount}
              </span>
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors hidden sm:block active:scale-95"
            title="還原預設範例資料"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
            title="廚房設定與飲食偏好"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
