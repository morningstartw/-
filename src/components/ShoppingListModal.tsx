import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Share2,
  PackagePlus,
  Sparkles,
} from 'lucide-react';
import { ShoppingItem, IngredientCategory, Ingredient } from '../types';

interface ShoppingListModalProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isChecked'>) => void;
  onImportToFridge: (selectedItems: ShoppingItem[]) => void;
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

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  items,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onImportToFridge,
  onClose,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState('顆');
  const [category, setCategory] = useState<IngredientCategory>('蔬菜');

  const checkedCount = items.filter((i) => i.isChecked).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddItem({
      name: name.trim(),
      amount: Math.max(0.5, Number(amount)),
      unit,
      category,
      source: 'manual',
    });
    setName('');
    setShowAddForm(false);
  };

  const [notice, setNotice] = useState<string | null>(null);

  const handleCopyList = () => {
    if (items.length === 0) return;
    const text = `🛒 智慧廚房採買清單：\n` +
      items.map((i) => `${i.isChecked ? '✓' : '□'} ${i.name} ${i.amount}${i.unit} [${i.category}]`).join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setNotice('✓ 採買清單已複製至剪貼簿！可貼到通訊軟體或備忘錄。');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleBatchImport = () => {
    const checkedItems = items.filter((i) => i.isChecked);
    if (checkedItems.length === 0) {
      setNotice('⚠️ 請先勾選已購買的食材再入庫！');
      setTimeout(() => setNotice(null), 3000);
      return;
    }
    onImportToFridge(checkedItems);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">缺料採購清單</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                自動統計週菜單缺額食材，購畢後可一鍵入庫至冰箱
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Notice Alert */}
          {notice && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 font-semibold text-xs flex items-center justify-between animate-in fade-in">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-slate-500 dark:text-slate-400 font-medium">
              共 <b>{items.length}</b> 項 · 已採購 <b>{checkedCount}</b> 項
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyList}
                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Share2 className="w-3 h-3" />
                <span>複製清單</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-2.5 py-1 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 font-semibold transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>手動加項</span>
              </button>
            </div>
          </div>

          {/* Quick Add Form Drawer */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in slide-in-from-top-2">
              <span className="font-bold text-slate-800 dark:text-slate-100 block">新增採買物品</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="食材品名 (例: 雞蛋、洋蔥)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IngredientCategory)}
                  className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-20 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-center font-bold text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="單位 (盒/包/顆)"
                  className="w-24 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-center text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
                >
                  加入清單
                </button>
              </div>
            </form>
          )}

          {/* List items */}
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <ShoppingCart className="w-8 h-8 mx-auto opacity-40" />
              <p>目前沒有任何缺料待買項目！</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                可從週菜單排程自動分析缺額，或點擊上方「手動加項」。
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-colors">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 flex items-center justify-between gap-2.5 transition-colors ${
                    item.isChecked
                      ? 'bg-slate-50/70 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div
                    onClick={() => onToggleItem(item.id)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none"
                  >
                    <button type="button" className="shrink-0 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                      {item.isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>
                    <div className="truncate">
                      <span
                        className={`font-semibold text-xs ${
                          item.isChecked
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">
                        {item.amount} {item.unit}
                      </span>
                      {item.relatedRecipeTitle && (
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          用於：{item.relatedRecipeTitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {item.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                      title="刪除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer sticky bar */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            已勾選 <b>{checkedCount}</b> 項食材
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
            >
              關閉
            </button>
            <button
              type="button"
              disabled={checkedCount === 0}
              onClick={handleBatchImport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <PackagePlus className="w-4 h-4" />
              <span>已購項目一鍵入庫</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
