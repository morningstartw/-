import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FridgeInventory } from './components/FridgeInventory';
import { AddIngredientModal } from './components/AddIngredientModal';
import { RecognitionModal } from './components/RecognitionModal';
import { RecipePromptModal } from './components/RecipePromptModal';
import { RecipeList } from './components/RecipeList';
import { RecipeDetail } from './components/RecipeDetail';
import { SwapRecipeModal } from './components/SwapRecipeModal';
import { PreferencesModal } from './components/PreferencesModal';
import { ActionToast } from './components/ActionToast';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { ShoppingListModal } from './components/ShoppingListModal';
import { MenuCheckerModal } from './components/MenuCheckerModal';
import { VercelDeployModal } from './components/VercelDeployModal';
import {
  Ingredient,
  Recipe,
  RecipeCombo,
  WeeklyMealSlot,
  ShoppingItem,
  UserPreferences,
  DetectedIngredient,
  DeductHistory,
} from './types';
import {
  INITIAL_INGREDIENTS,
  INITIAL_RECIPES,
  INITIAL_COMBO,
  INITIAL_WEEKLY_SLOTS,
  INITIAL_SHOPPING_ITEMS,
  DEFAULT_PREFERENCES,
} from './data/mockData';

export default function App() {
  // 1. Persistent State
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_ingredients');
      return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
    } catch {
      return INITIAL_INGREDIENTS;
    }
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_recipes');
      return saved ? JSON.parse(saved) : INITIAL_RECIPES;
    } catch {
      return INITIAL_RECIPES;
    }
  });

  const [combo, setCombo] = useState<RecipeCombo | null>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_combo');
      return saved ? JSON.parse(saved) : INITIAL_COMBO;
    } catch {
      return INITIAL_COMBO;
    }
  });

  const [weeklySlots, setWeeklySlots] = useState<WeeklyMealSlot[]>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_weekly');
      return saved ? JSON.parse(saved) : INITIAL_WEEKLY_SLOTS;
    } catch {
      return INITIAL_WEEKLY_SLOTS;
    }
  });

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_shopping');
      return saved ? JSON.parse(saved) : INITIAL_SHOPPING_ITEMS;
    } catch {
      return INITIAL_SHOPPING_ITEMS;
    }
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // 2. Navigation State
  const [currentTab, setCurrentTab] = useState<'inventory' | 'weekly' | 'recipes' | 'detail'>('inventory');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  // 3. Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecognitionModal, setShowRecognitionModal] = useState(false);
  const [showPromptBuilder, setShowPromptBuilder] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [showMenuChecker, setShowMenuChecker] = useState(false);
  const [showVercelModal, setShowVercelModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [recipeToSwap, setRecipeToSwap] = useState<Recipe | null>(null);

  // 4. Loading State
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [isGeneratingWeeklyPlan, setIsGeneratingWeeklyPlan] = useState(false);
  const [isSwappingRecipe, setIsSwappingRecipe] = useState(false);

  // 5. Toast & Undo State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastDeduction, setLastDeduction] = useState<DeductHistory | null>(null);

  // Dark Mode state & persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_theme');
      if (saved) return saved === 'dark';
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('smart_fridge_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('smart_fridge_theme', 'light');
      }
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smart_fridge_ingredients', JSON.stringify(ingredients));
    } catch (e) {
      console.error(e);
    }
  }, [ingredients]);

  useEffect(() => {
    try {
      localStorage.setItem('smart_fridge_recipes', JSON.stringify(recipes));
    } catch (e) {
      console.error(e);
    }
  }, [recipes]);

  useEffect(() => {
    try {
      localStorage.setItem('smart_fridge_combo', JSON.stringify(combo));
    } catch (e) {
      console.error(e);
    }
  }, [combo]);

  useEffect(() => {
    try {
      localStorage.setItem('smart_fridge_weekly', JSON.stringify(weeklySlots));
    } catch (e) {
      console.error(e);
    }
  }, [weeklySlots]);

  useEffect(() => {
    try {
      localStorage.setItem('smart_fridge_shopping', JSON.stringify(shoppingItems));
    } catch (e) {
      console.error(e);
    }
  }, [shoppingItems]);

  useEffect(() => {
    try {
      localStorage.setItem('smart_fridge_preferences', JSON.stringify(preferences));
    } catch (e) {
      console.error(e);
    }
  }, [preferences]);

  // Inventory actions
  const handleUpdateAmount = (id: string, delta: number) => {
    setIngredients((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newAmount = Number(Math.max(0, item.amount + delta).toFixed(1));
            return { ...item, amount: newAmount };
          }
          return item;
        })
        .filter((item) => item.amount > 0)
    );
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddIngredient = (newIng: Omit<Ingredient, 'id' | 'addedAt'>) => {
    const item: Ingredient = {
      ...newIng,
      id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      addedAt: new Date().toISOString(),
    };
    setIngredients((prev) => [item, ...prev]);
  };

  // Recognition confirm (Screen 2 -> Fridge)
  const handleConfirmRecognition = (detected: DetectedIngredient[]) => {
    const newItems: Ingredient[] = detected.map((d, index) => ({
      id: `ing-snap-${Date.now()}-${index}`,
      name: d.name,
      amount: d.amount,
      unit: d.unit,
      category: d.category,
      addedAt: new Date().toISOString(),
      expiryDays: 5,
    }));

    setIngredients((prev) => [...newItems, ...prev]);
    setToastMessage(`成功新增 ${newItems.length} 項食材至冰箱！`);
  };

  // Recipe Generation (Screen 3 -> Screen 4 / List)
  const handleGenerateRecipes = async (params: {
    equipment: string[];
    dietary: string[];
    maxTimeMinutes: number;
    extraNotes: string;
    saveAsDefault: boolean;
    mode: 'single' | 'combo';
  }) => {
    if (params.saveAsDefault) {
      setPreferences((prev) => ({
        ...prev,
        equipment: params.equipment,
        dietary: params.dietary,
        maxTimeMinutes: params.maxTimeMinutes,
        recipeMode: params.mode,
      }));
    }

    setIsGeneratingRecipes(true);
    try {
      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          equipment: params.equipment,
          dietary: params.dietary,
          maxTimeMinutes: params.maxTimeMinutes,
          extraNotes: params.extraNotes,
          mode: params.mode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '生成食譜失敗');
      }

      const data = await response.json();
      if (data.recipes && data.recipes.length > 0) {
        const enriched = data.recipes.map((r: Recipe, idx: number) => ({
          ...r,
          imageUrl:
            r.imageUrl ||
            [
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
            ][idx % 3],
        }));
        setRecipes(enriched);

        if (data.combo) {
          setCombo(data.combo);
        }

        setShowPromptBuilder(false);
        setCurrentTab('recipes');
        setToastMessage(
          params.mode === 'combo'
            ? `✨ AI 成功為您生成「${data.combo?.comboTitle || '一湯兩菜均衡套餐'}」！`
            : `✨ AI 為您精心設計了 ${enriched.length} 道零浪費食譜！`
        );
      } else {
        throw new Error('未取得推薦食譜');
      }
    } catch (err: any) {
      console.error(err);
      setToastMessage('⚠️ ' + (err.message || '生成失敗，請檢查網路連線或 API Key 後重試。'));
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  // Dynamic Swap (Screen 4 Swap Trigger)
  const handleConfirmSwap = async (feedback: string) => {
    if (!recipeToSwap) return;

    setIsSwappingRecipe(true);
    try {
      const response = await fetch('/api/swap-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRecipeTitle: recipeToSwap.title,
          feedback,
          ingredients,
          equipment: preferences.equipment,
          dietary: preferences.dietary,
        }),
      });

      if (!response.ok) {
        throw new Error('更換食譜失敗');
      }

      const data = await response.json();
      if (data.recipe) {
        const newRecipe: Recipe = {
          ...data.recipe,
          imageUrl:
            data.recipe.imageUrl ||
            'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        };

        setRecipes((prev) =>
          prev.map((r) => (r.id === recipeToSwap.id ? newRecipe : r))
        );
        setActiveRecipe(newRecipe);
        setShowSwapModal(false);
        setRecipeToSwap(null);
        setToastMessage(`已依您的需求換成新菜色「${newRecipe.title}」！`);
      }
    } catch (err: any) {
      console.error(err);
      setToastMessage('⚠️ ' + (err.message || '換菜失敗，請重試。'));
    } finally {
      setIsSwappingRecipe(false);
    }
  };

  // Cooked! Auto-Deduct & Undo Toast
  const handleCooked = (recipe: Recipe) => {
    const deductionItems: DeductHistory['deductedItems'] = [];

    const updatedIngredients = ingredients
      .map((item) => {
        const match = recipe.usedIngredients.find(
          (u) =>
            u.name.toLowerCase().includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(u.name.toLowerCase())
        );

        if (match) {
          const deductAmt = match.amount;
          const newAmount = Number(Math.max(0, item.amount - deductAmt).toFixed(1));

          deductionItems.push({
            id: item.id,
            name: item.name,
            amount: deductAmt,
            unit: item.unit,
            previousAmount: item.amount,
            category: item.category,
          });

          return { ...item, amount: newAmount };
        }
        return item;
      })
      .filter((item) => item.amount > 0);

    setLastDeduction({
      id: `deduct-${Date.now()}`,
      recipeTitle: recipe.title,
      deductedItems: deductionItems,
      timestamp: Date.now(),
    });

    setIngredients(updatedIngredients);
    setToastMessage(`已從冰箱自動扣除 ${deductionItems.length} 項食材！`);

    setCurrentTab('inventory');
    setActiveRecipe(null);
  };

  // Cook entire combo
  const handleCookCombo = (selectedCombo: RecipeCombo) => {
    const deductionItems: DeductHistory['deductedItems'] = [];

    let currentStock = [...ingredients];
    selectedCombo.dishes.forEach((dish) => {
      dish.usedIngredients.forEach((used) => {
        const matchIdx = currentStock.findIndex(
          (item) =>
            item.name.toLowerCase().includes(used.name.toLowerCase()) ||
            used.name.toLowerCase().includes(item.name.toLowerCase())
        );
        if (matchIdx !== -1) {
          const item = currentStock[matchIdx];
          const newAmount = Number(Math.max(0, item.amount - used.amount).toFixed(1));
          deductionItems.push({
            id: item.id,
            name: item.name,
            amount: used.amount,
            unit: item.unit,
            previousAmount: item.amount,
            category: item.category,
          });
          currentStock[matchIdx] = { ...item, amount: newAmount };
        }
      });
    });

    currentStock = currentStock.filter((i) => i.amount > 0);

    setLastDeduction({
      id: `deduct-combo-${Date.now()}`,
      recipeTitle: selectedCombo.comboTitle,
      deductedItems: deductionItems,
      timestamp: Date.now(),
    });

    setIngredients(currentStock);
    setToastMessage(`已完成套餐！自冰箱扣除 ${deductionItems.length} 項食材！`);
    setCurrentTab('inventory');
  };

  // Undo cooked deduction
  const handleUndoDeduction = () => {
    if (!lastDeduction) return;

    setIngredients((prev) => {
      const restored = [...prev];
      lastDeduction.deductedItems.forEach((d) => {
        const existingIdx = restored.findIndex((item) => item.id === d.id);
        if (existingIdx !== -1) {
          restored[existingIdx] = {
            ...restored[existingIdx],
            amount: d.previousAmount,
          };
        } else {
          restored.push({
            id: d.id || `ing-restored-${Date.now()}`,
            name: d.name,
            amount: d.previousAmount,
            unit: d.unit,
            category: d.category,
            addedAt: new Date().toISOString(),
            expiryDays: 4,
          });
        }
      });
      return restored;
    });

    setLastDeduction(null);
    setToastMessage('已成功復原食材庫存！');
  };

  // Weekly Planner Actions
  const handleUpdateWeeklySlot = (slotId: string, recipe?: Recipe, comboItem?: RecipeCombo) => {
    setWeeklySlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, recipe, combo: comboItem, isCooked: false } : s))
    );
    setToastMessage('已成功排入週菜單！');
  };

  const handleClearWeeklySlot = (slotId: string) => {
    setWeeklySlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, recipe: undefined, combo: undefined, isCooked: false } : s))
    );
  };

  const handleToggleCookedWeeklySlot = (slotId: string) => {
    setWeeklySlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, isCooked: !s.isCooked } : s))
    );
  };

  // Generate Weekly Meal Plan via AI API
  const handleGenerateWeeklyPlan = async () => {
    setIsGeneratingWeeklyPlan(true);
    try {
      const res = await fetch('/api/generate-weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          equipment: preferences.equipment,
          dietary: preferences.dietary,
        }),
      });

      if (!res.ok) throw new Error('每週排程生成失敗');
      const data = await res.json();

      if (data.schedule && data.schedule.length > 0) {
        // Map schedule into weekly slots
        const newSlots: WeeklyMealSlot[] = data.schedule.map((sch: any, idx: number) => {
          const matchedRecipe: Recipe = {
            id: `rec-week-${Date.now()}-${idx}`,
            title: sch.dishTitle,
            description: `專為${sch.day}${sch.mealType}安排之均衡佳餚`,
            cookingTimeMinutes: sch.cookingTimeMinutes || 20,
            difficulty: '簡易',
            matchPercentage: 85,
            dishType: sch.dishType || '家常料理',
            equipmentUsed: ['平底鍋'],
            usedIngredients: (sch.usedFridgeItems || []).map((name: string) => ({
              name,
              amount: 1,
              unit: '份',
            })),
            additionalIngredients: [{ name: '常備油鹽', amount: '適量', optional: true }],
            steps: [
              { stepNumber: 1, title: '準備食材', instruction: '清洗並處理食材切塊備用。' },
              { stepNumber: 2, title: '下鍋烹調', instruction: '熱鍋少油快炒至飄香熟透即可盛盤。', timerSeconds: 180 },
            ],
            nutrition: { calories: sch.calories || 350, protein: 25, carbs: 30, fat: 12 },
            chefTip: '提前備好食材，料理更省時流暢。',
          };

          return {
            id: `slot-gen-${sch.day}-${sch.mealType}-${idx}`,
            day: sch.day,
            mealType: sch.mealType,
            recipe: matchedRecipe,
            isCooked: false,
          };
        });

        setWeeklySlots(newSlots);

        // Add missing groceries to shopping list
        if (data.missingGroceries && data.missingGroceries.length > 0) {
          const newShopping: ShoppingItem[] = data.missingGroceries.map((g: any, i: number) => ({
            id: `shop-gen-${Date.now()}-${i}`,
            name: g.name,
            amount: g.amount || 1,
            unit: g.unit || '份',
            category: g.category || '蔬菜',
            isChecked: false,
            source: 'auto_shortage' as const,
            relatedRecipeTitle: g.neededForDish || '每週排程料理',
          }));

          setShoppingItems((prev) => [...newShopping, ...prev]);
        }

        setToastMessage(`✨ 已為您完整排定一週菜單，並新增 ${data.missingGroceries?.length || 0} 項缺料至採買清單！`);
      }
    } catch (err: any) {
      console.error(err);
      setToastMessage('⚠️ ' + (err.message || '生成每週菜單失敗，請稍後重試。'));
    } finally {
      setIsGeneratingWeeklyPlan(false);
    }
  };

  // Shopping List Actions
  const handleToggleShoppingItem = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isChecked: !i.isChecked } : i))
    );
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddShoppingItem = (item: Omit<ShoppingItem, 'id' | 'isChecked'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: `shop-${Date.now()}`,
      isChecked: false,
    };
    setShoppingItems((prev) => [newItem, ...prev]);
  };

  // Import checked shopping items directly to fridge inventory
  const handleImportToFridge = (checked: ShoppingItem[]) => {
    const newIngredients: Ingredient[] = checked.map((c, i) => ({
      id: `ing-bought-${Date.now()}-${i}`,
      name: c.name,
      amount: c.amount,
      unit: c.unit,
      category: c.category,
      addedAt: new Date().toISOString(),
      expiryDays: 5,
    }));

    setIngredients((prev) => [...newIngredients, ...prev]);
    // remove imported from shopping list
    const checkedIds = new Set(checked.map((c) => c.id));
    setShoppingItems((prev) => prev.filter((i) => !checkedIds.has(i.id)));
    setShowShoppingListModal(false);
    setToastMessage(`🎉 成功將 ${checked.length} 項採買食材入庫至冰箱！`);
  };

  // Add missing items from custom menu checker to shopping list
  const handleAddMissingToShoppingList = (
    missingItems: { name: string; amount: number; unit: string; category: string; relatedDish: string }[]
  ) => {
    const newItems: ShoppingItem[] = missingItems.map((m, idx) => ({
      id: `shop-miss-${Date.now()}-${idx}`,
      name: m.name,
      amount: m.amount,
      unit: m.unit,
      category: m.category as any,
      isChecked: false,
      source: 'auto_shortage',
      relatedRecipeTitle: m.relatedDish,
    }));
    setShoppingItems((prev) => [...newItems, ...prev]);
    setToastMessage(`🛒 已將 ${missingItems.length} 項缺少食材加入採購清單！`);
  };

  // Reset to initial mock data
  const handleResetData = () => {
    if (confirm('是否確認還原為預設食材與食譜範例？')) {
      setIngredients(INITIAL_INGREDIENTS);
      setRecipes(INITIAL_RECIPES);
      setCombo(INITIAL_COMBO);
      setWeeklySlots(INITIAL_WEEKLY_SLOTS);
      setShoppingItems(INITIAL_SHOPPING_ITEMS);
      setPreferences(DEFAULT_PREFERENCES);
      setActiveRecipe(null);
      setCurrentTab('inventory');
      setToastMessage('已還原為初始預設資料');
    }
  };

  const plannedCount = weeklySlots.filter((s) => s.recipe || s.combo).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setActiveRecipe(null);
        }}
        inventoryCount={ingredients.length}
        plannedMealsCount={plannedCount}
        recipesCount={recipes.length}
        shoppingListCount={shoppingItems.filter((i) => !i.isChecked).length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenShoppingList={() => setShowShoppingListModal(true)}
        onOpenMenuChecker={() => setShowMenuChecker(true)}
        onOpenVercelDeploy={() => setShowVercelModal(true)}
        onOpenSettings={() => setShowPreferences(true)}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {currentTab === 'detail' && activeRecipe ? (
          /* Screen 4: Recipe Detail */
          <RecipeDetail
            recipe={activeRecipe}
            inventory={ingredients}
            onBack={() => {
              setCurrentTab('recipes');
              setActiveRecipe(null);
            }}
            onCooked={handleCooked}
            onRequestSwap={(recipe) => {
              setRecipeToSwap(recipe);
              setShowSwapModal(true);
            }}
          />
        ) : currentTab === 'weekly' ? (
          /* Feature: Weekly Meal Planner */
          <WeeklyPlanner
            slots={weeklySlots}
            ingredients={ingredients}
            recipes={recipes}
            onUpdateSlot={handleUpdateWeeklySlot}
            onClearSlot={handleClearWeeklySlot}
            onToggleCooked={handleToggleCookedWeeklySlot}
            onGenerateAIPlan={handleGenerateWeeklyPlan}
            isGeneratingPlan={isGeneratingWeeklyPlan}
            onOpenShoppingList={() => setShowShoppingListModal(true)}
            shoppingListCount={shoppingItems.filter((i) => !i.isChecked).length}
            onSelectRecipeDetail={(recipe) => {
              setActiveRecipe(recipe);
              setCurrentTab('detail');
            }}
          />
        ) : currentTab === 'recipes' ? (
          /* Recipe List Screen (Includes Combo & Single Recipes) */
          <RecipeList
            recipes={recipes}
            combo={combo}
            onSelectRecipe={(recipe) => {
              setActiveRecipe(recipe);
              setCurrentTab('detail');
            }}
            onSelectCombo={(selectedCombo) => handleCookCombo(selectedCombo)}
            onOpenPromptBuilder={() => setShowPromptBuilder(true)}
            onRequestSwap={(recipe) => {
              setRecipeToSwap(recipe);
              setShowSwapModal(true);
            }}
            onAddToPlanner={(recipe) => {
              const emptySlot = weeklySlots.find((s) => !s.recipe && !s.combo);
              if (emptySlot) {
                handleUpdateWeeklySlot(emptySlot.id, recipe);
                setCurrentTab('weekly');
              } else {
                handleUpdateWeeklySlot(weeklySlots[0].id, recipe);
                setCurrentTab('weekly');
              }
            }}
          />
        ) : (
          /* Screen 1: Fridge Inventory & Expiry Dashboard */
          <FridgeInventory
            ingredients={ingredients}
            onUpdateAmount={handleUpdateAmount}
            onDeleteIngredient={handleDeleteIngredient}
            onOpenAddModal={() => setShowAddModal(true)}
            onOpenRecognitionModal={() => setShowRecognitionModal(true)}
            onOpenRecipePromptBuilder={() => setShowPromptBuilder(true)}
            onOpenMenuChecker={() => setShowMenuChecker(true)}
          />
        )}
      </main>

      {/* Modal: Manual Add Ingredient */}
      {showAddModal && (
        <AddIngredientModal
          onAdd={handleAddIngredient}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Modal: Screen 2 Snap-to-Inventory Recognition */}
      {showRecognitionModal && (
        <RecognitionModal
          onConfirm={handleConfirmRecognition}
          onClose={() => setShowRecognitionModal(false)}
        />
      )}

      {/* Modal: Screen 3 Recipe Prompt Builder (Supports Combo / Single Mode) */}
      {showPromptBuilder && (
        <RecipePromptModal
          ingredients={ingredients}
          initialPreferences={preferences}
          isGenerating={isGeneratingRecipes}
          onGenerate={handleGenerateRecipes}
          onClose={() => setShowPromptBuilder(false)}
        />
      )}

      {/* Modal: Kitchen Preferences */}
      {showPreferences && (
        <PreferencesModal
          preferences={preferences}
          onSave={(prefs) => {
            setPreferences(prefs);
            setToastMessage('已更新個人飲食與設備設定');
          }}
          onClose={() => setShowPreferences(false)}
        />
      )}

      {/* Modal: Shopping List & Batch Ingestion */}
      {showShoppingListModal && (
        <ShoppingListModal
          items={shoppingItems}
          onToggleItem={handleToggleShoppingItem}
          onDeleteItem={handleDeleteShoppingItem}
          onAddItem={handleAddShoppingItem}
          onImportToFridge={handleImportToFridge}
          onClose={() => setShowShoppingListModal(false)}
        />
      )}

      {/* Modal: Custom Menu Checker & AI Suggestion */}
      {showMenuChecker && (
        <MenuCheckerModal
          ingredients={ingredients}
          preferences={preferences}
          onAddMissingToShoppingList={handleAddMissingToShoppingList}
          onClose={() => setShowMenuChecker(false)}
        />
      )}

      {/* Modal: Vercel Cloud Deployment Guide */}
      {showVercelModal && (
        <VercelDeployModal onClose={() => setShowVercelModal(false)} />
      )}

      {/* Modal: Dynamic Swap Recipe */}
      {showSwapModal && recipeToSwap && (
        <SwapRecipeModal
          currentRecipeTitle={recipeToSwap.title}
          isSwapping={isSwappingRecipe}
          onConfirmSwap={handleConfirmSwap}
          onClose={() => {
            setShowSwapModal(false);
            setRecipeToSwap(null);
          }}
        />
      )}

      {/* Action Toast with 5-Second Undo */}
      {toastMessage && (
        <ActionToast
          message={toastMessage}
          onUndo={lastDeduction ? handleUndoDeduction : () => setToastMessage(null)}
          onDismiss={() => {
            setToastMessage(null);
            setLastDeduction(null);
          }}
          durationMs={5000}
        />
      )}
    </div>
  );
}
