import {
  Ingredient,
  Recipe,
  RecipeCombo,
  UserPreferences,
  WeeklyMealSlot,
  ShoppingItem,
} from '../types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: '雞胸肉',
    amount: 2,
    unit: '塊',
    category: '肉類',
    addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    expiryDays: 3,
  },
  {
    id: 'ing-2',
    name: '綠花椰菜',
    amount: 1,
    unit: '顆',
    category: '蔬菜',
    addedAt: new Date(Date.now() - 86400000).toISOString(),
    expiryDays: 4,
  },
  {
    id: 'ing-3',
    name: '牛番茄',
    amount: 3,
    unit: '顆',
    category: '蔬菜',
    addedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    expiryDays: 2,
  },
  {
    id: 'ing-4',
    name: '雞蛋',
    amount: 6,
    unit: '顆',
    category: '蛋奶豆',
    addedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    expiryDays: 7,
  },
  {
    id: 'ing-5',
    name: '洋蔥',
    amount: 2,
    unit: '顆',
    category: '蔬菜',
    addedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    expiryDays: 10,
  },
  {
    id: 'ing-6',
    name: '板豆腐',
    amount: 1,
    unit: '盒',
    category: '蛋奶豆',
    addedAt: new Date(Date.now() - 86400000).toISOString(),
    expiryDays: 2,
  },
  {
    id: 'ing-7',
    name: '鴻喜菇',
    amount: 1,
    unit: '包',
    category: '蔬菜',
    addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    expiryDays: 4,
  },
  {
    id: 'ing-8',
    name: '大蒜',
    amount: 5,
    unit: '瓣',
    category: '調味醬料',
    addedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    expiryDays: 14,
  },
];

export const AVAILABLE_EQUIPMENT = [
  '平底鍋',
  '電鍋',
  '微波爐',
  '氣炸鍋',
  '單口瓦斯爐',
  '烤箱',
  '電磁爐',
  '不沾深炒鍋',
];

export const DIETARY_OPTIONS = [
  '高蛋白 / 增肌',
  '低醣 / 減脂',
  '清淡少油',
  '全素 / 無五辛',
  '蛋奶素',
  '地中海飲食',
  '不吃海鮮',
  '避免辛辣',
];

export const COOKING_TIME_OPTIONS = [
  { label: '15 分鐘快煮', value: 15 },
  { label: '30 分鐘搞定', value: 30 },
  { label: '不限時間 (45m+)', value: 60 },
];

export const QUICK_NOTE_SUGGESTIONS = [
  '想喝溫熱湯品',
  '清冰箱優先消耗即期食材',
  '適合隔天帶便當',
  '下班宵夜輕鬆煮',
  '單人份料理好收拾',
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  equipment: ['平底鍋', '電鍋', '微波爐'],
  dietary: ['高蛋白 / 增肌', '清淡少油'],
  maxTimeMinutes: 30,
  defaultServings: 1,
  recipeMode: 'combo',
};

// Demo sample photos for quick recognition test
export const DEMO_FRIDGE_PHOTOS = [
  {
    id: 'sample-1',
    name: '🥦 鮮蔬健康日常冰箱',
    description: '含有花椰菜、番茄、雞蛋、胡蘿蔔與豆腐',
    url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    ingredients: [
      { name: '綠花椰菜', amount: 1, unit: '顆', category: '蔬菜' as const },
      { name: '牛番茄', amount: 2, unit: '顆', category: '蔬菜' as const },
      { name: '雞蛋', amount: 4, unit: '顆', category: '蛋奶豆' as const },
      { name: '胡蘿蔔', amount: 1, unit: '根', category: '蔬菜' as const },
      { name: '板豆腐', amount: 1, unit: '盒', category: '蛋奶豆' as const },
    ],
  },
  {
    id: 'sample-2',
    name: '🥩 健身增肌高蛋白冷藏',
    description: '含有雞胸肉、雞蛋、青椒、洋蔥與大蒜',
    url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80',
    ingredients: [
      { name: '雞胸肉', amount: 2, unit: '塊', category: '肉類' as const },
      { name: '青椒', amount: 2, unit: '顆', category: '蔬菜' as const },
      { name: '洋蔥', amount: 1, unit: '顆', category: '蔬菜' as const },
      { name: '雞蛋', amount: 6, unit: '顆', category: '蛋奶豆' as const },
      { name: '蒜頭', amount: 4, unit: '瓣', category: '調味醬料' as const },
    ],
  },
  {
    id: 'sample-3',
    name: '🍲 租屋極簡清冰箱小籃',
    description: '含有高麗菜、鴻喜菇、嫩豆腐、貢丸',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    ingredients: [
      { name: '高麗菜', amount: 0.5, unit: '顆', category: '蔬菜' as const },
      { name: '鴻喜菇', amount: 1, unit: '包', category: '蔬菜' as const },
      { name: '嫩豆腐', amount: 1, unit: '盒', category: '蛋奶豆' as const },
      { name: '貢丸', amount: 4, unit: '顆', category: '肉類' as const },
    ],
  },
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    title: '蒜香黑椒鮮蔬炒嫩雞',
    description: '利用冰箱現有雞胸肉與花椰菜、洋蔥，少油快炒出香嫩多汁的減脂增肌料理，極致清冰箱首選！',
    cookingTimeMinutes: 15,
    difficulty: '新手友好',
    matchPercentage: 90,
    dishType: '高蛋白快炒',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    equipmentUsed: ['平底鍋'],
    usedIngredients: [
      { name: '雞胸肉', amount: 1, unit: '塊' },
      { name: '綠花椰菜', amount: 0.5, unit: '顆' },
      { name: '洋蔥', amount: 0.5, unit: '顆' },
      { name: '大蒜', amount: 2, unit: '瓣' },
    ],
    additionalIngredients: [
      { name: '食用油', amount: '1 小匙', optional: false },
      { name: '醬油', amount: '1 大匙', optional: false },
      { name: '粗黑胡椒粒', amount: '適量', optional: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '備料切塊',
        instruction: '雞胸肉順紋切約 2 公分小厚塊，加入 1 茶匙醬油略醃；花椰菜切小朵洗淨，洋蔥順紋切絲，大蒜拍碎切末。',
      },
      {
        stepNumber: 2,
        title: '花椰菜微波或快速汆燙',
        instruction: '花椰菜放入碗中淋 1 大匙水，進微波爐強火加熱 1 分半（或滾水汆燙 60 秒）保持翠綠脆甜，瀝乾備用。',
        timerSeconds: 90,
      },
      {
        stepNumber: 3,
        title: '熱鍋香煎雞肉',
        instruction: '平底鍋倒入 1 茶匙油，中小火熱鍋後放入雞胸肉塊，煎至兩面金黃微焦香（約 3 分鐘），盛起備用。',
        timerSeconds: 180,
      },
      {
        stepNumber: 4,
        title: '爆香洋蔥與下菜快炒',
        instruction: '同鍋利用餘油下蒜碎與洋蔥絲炒至透明飄香，接著倒回雞胸肉與花椰菜大火快速翻炒均勻。',
        timerSeconds: 60,
      },
      {
        stepNumber: 5,
        title: '調味起鍋',
        instruction: '撒上適量現磨黑胡椒粒與半茶匙醬油提香，翻勻後即可趁熱盛盤享用！',
      },
    ],
    nutrition: {
      calories: 320,
      protein: 38,
      carbs: 12,
      fat: 9,
    },
    chefTip: '雞胸肉下鍋前先抓一點水或半匙醬油靜置 3 分鐘，煎的時候鎖住水分，口感柔嫩不乾柴！',
  },
  {
    id: 'rec-2',
    title: '番茄豆腐滑蛋暖心煲',
    description: '滿滿茄紅素與滑嫩豆腐、鮮雞蛋的完美結合，免高湯就能煮出酸甜濃郁的低卡暖胃湯品！',
    cookingTimeMinutes: 18,
    difficulty: '簡易',
    matchPercentage: 85,
    dishType: '低卡暖胃湯品',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    equipmentUsed: ['平底鍋', '電磁爐'],
    usedIngredients: [
      { name: '牛番茄', amount: 2, unit: '顆' },
      { name: '板豆腐', amount: 1, unit: '盒' },
      { name: '雞蛋', amount: 2, unit: '顆' },
      { name: '大蒜', amount: 1, unit: '瓣' },
    ],
    additionalIngredients: [
      { name: '鹽', amount: '半茶匙', optional: false },
      { name: '白胡椒粉', amount: '少許', optional: true },
      { name: '開水', amount: '400 毫升', optional: false },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '食材準備',
        instruction: '牛番茄洗淨切塊；板豆腐切成 2 公分方塊；雞蛋打入小碗充分打散成蛋液。',
      },
      {
        stepNumber: 2,
        title: '番茄炒出天然茄紅汁',
        instruction: '鍋內下半匙油，下蒜末與番茄塊中火煸炒約 2-3 分鐘，用鍋鏟略微壓出番茄酸甜汁液。',
        timerSeconds: 150,
      },
      {
        stepNumber: 3,
        title: '入水煨煮豆腐',
        instruction: '加入 400ml 開水煮沸，輕輕放入豆腐塊，蓋上鍋蓋中小火煨煮 5 分鐘入味。',
        timerSeconds: 300,
      },
      {
        stepNumber: 4,
        title: '淋入蛋花與調味',
        instruction: '開大火沸騰，以繞圈方式慢慢淋入蛋液，靜置 5 秒後再輕輕推勻形成滑順蛋花，下鹽與少許胡椒粉調味即完成。',
      },
    ],
    nutrition: {
      calories: 245,
      protein: 21,
      carbs: 14,
      fat: 11,
    },
    chefTip: '炒番茄時加一小撮鹽能幫助番茄更快出汁軟化，湯底自然濃郁回甘。',
  },
];

export const INITIAL_COMBO: RecipeCombo = {
  id: 'combo-1',
  comboTitle: '高蛋白蒜香嫩雞雙菜一湯元氣套餐',
  description: '蒜香黑椒嫩雞胸 + 清燙蒜蓉花椰菜 + 番茄豆腐蛋花暖湯，葷素搭配、極致消耗冰箱即期番茄與花椰菜！',
  totalCookingTimeMinutes: 20,
  matchPercentage: 92,
  cookingSequenceTips: '先起鍋煮番茄豆腐湯，微波快速汆燙花椰菜，最後熱平底鍋快煎雞胸肉，20分鐘同步熱騰騰開飯！',
  combinedNutrition: {
    calories: 565,
    protein: 59,
    carbs: 26,
    fat: 20,
  },
  dishes: INITIAL_RECIPES,
};

export const INITIAL_WEEKLY_SLOTS: WeeklyMealSlot[] = [
  { id: 'slot-mon-lunch', day: '週一', mealType: '午餐', recipe: INITIAL_RECIPES[0], isCooked: true },
  { id: 'slot-mon-dinner', day: '週一', mealType: '晚餐', recipe: INITIAL_RECIPES[1], isCooked: false },
  { id: 'slot-tue-lunch', day: '週二', mealType: '午餐', combo: INITIAL_COMBO, isCooked: false },
  { id: 'slot-tue-dinner', day: '週二', mealType: '晚餐', isCooked: false },
  { id: 'slot-wed-lunch', day: '週三', mealType: '午餐', isCooked: false },
  { id: 'slot-wed-dinner', day: '週三', mealType: '晚餐', isCooked: false },
  { id: 'slot-thu-lunch', day: '週四', mealType: '午餐', isCooked: false },
  { id: 'slot-thu-dinner', day: '週四', mealType: '晚餐', isCooked: false },
  { id: 'slot-fri-lunch', day: '週五', mealType: '午餐', isCooked: false },
  { id: 'slot-fri-dinner', day: '週五', mealType: '晚餐', isCooked: false },
  { id: 'slot-sat-lunch', day: '週六', mealType: '午餐', isCooked: false },
  { id: 'slot-sat-dinner', day: '週六', mealType: '晚餐', isCooked: false },
  { id: 'slot-sun-lunch', day: '週日', mealType: '午餐', isCooked: false },
  { id: 'slot-sun-dinner', day: '週日', mealType: '晚餐', isCooked: false },
];

export const INITIAL_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 'shop-1',
    name: '青江菜',
    amount: 2,
    unit: '把',
    category: '蔬菜',
    isChecked: false,
    source: 'auto_shortage',
    relatedRecipeTitle: '週二蒜香鮮蔬拌麵',
  },
  {
    id: 'shop-2',
    name: '全脂牛奶',
    amount: 1,
    unit: '瓶',
    category: '蛋奶豆',
    isChecked: false,
    source: 'manual',
  },
  {
    id: 'shop-3',
    name: '生薑',
    amount: 1,
    unit: '塊',
    category: '調味醬料',
    isChecked: true,
    source: 'manual',
  },
];

