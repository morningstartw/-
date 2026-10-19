export type IngredientCategory =
  | '蔬菜'
  | '肉類'
  | '海鮮'
  | '蛋奶豆'
  | '水果'
  | '主食澱粉'
  | '調味醬料'
  | '其他';

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
  addedAt: string;
  expiryDays?: number; // 預計幾天內食用完畢
}

export interface DetectedIngredient {
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
}

export interface UsedIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface AdditionalIngredient {
  name: string;
  amount: string;
  optional?: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  timerSeconds?: number;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTimeMinutes: number;
  difficulty: string;
  matchPercentage: number;
  dishType: string;
  equipmentUsed: string[];
  usedIngredients: UsedIngredient[];
  additionalIngredients: AdditionalIngredient[];
  steps: RecipeStep[];
  nutrition: NutritionInfo;
  chefTip: string;
  imageUrl?: string;
}

export interface RecipeCombo {
  id: string;
  comboTitle: string;
  description: string;
  totalCookingTimeMinutes: number;
  combinedNutrition: NutritionInfo;
  dishes: Recipe[];
  cookingSequenceTips: string;
  matchPercentage: number;
  imageUrl?: string;
}

export type DayName = '週一' | '週二' | '週三' | '週四' | '週五' | '週六' | '週日';
export type MealType = '午餐' | '晚餐';

export interface WeeklyMealSlot {
  id: string;
  day: DayName;
  mealType: MealType;
  recipe?: Recipe;
  combo?: RecipeCombo;
  isCooked: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
  isChecked: boolean;
  source: 'auto_shortage' | 'manual';
  relatedRecipeTitle?: string;
}

export interface UserPreferences {
  equipment: string[];
  dietary: string[];
  maxTimeMinutes: number;
  defaultServings: number;
  recipeMode: 'single' | 'combo'; // 單道或套餐模式
}

export interface DeductHistory {
  id: string;
  recipeTitle: string;
  deductedItems: {
    id?: string;
    name: string;
    amount: number;
    unit: string;
    previousAmount: number;
    category: IngredientCategory;
  }[];
  timestamp: number;
}

export interface DishAnalysis {
  dishName: string;
  inStock: string[];
  missing: string[];
}

export interface OptimizedDish {
  dishTitle: string;
  dishType: string;
  description: string;
  whyChanged: string;
  cookingTimeMinutes: number;
}

export interface CompletionPlan {
  planTitle: string;
  strategySummary: string;
  optimizedDishes: OptimizedDish[];
  optimizedMissingIngredients: {
    name: string;
    amount: number;
    unit: string;
    category: IngredientCategory;
  }[];
}

export interface MenuCheckResult {
  menuTitle: string;
  overallMatchRate: number;
  dishesAnalysis: DishAnalysis[];
  totalInStockIngredients: {
    name: string;
    amount: number;
    unit: string;
  }[];
  totalMissingIngredients: {
    name: string;
    amount: number;
    unit: string;
    category: IngredientCategory;
    neededForDish: string;
  }[];
  completionPlan: CompletionPlan;
}

