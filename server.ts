import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing with 20MB limit for image uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to extract base64 data and mimeType
function parseImageData(dataUrlOrBase64: string): { mimeType: string; data: string } {
  if (dataUrlOrBase64.startsWith('data:')) {
    const match = dataUrlOrBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return { mimeType: match[1], data: match[2] };
    }
  }
  return { mimeType: 'image/jpeg', data: dataUrlOrBase64 };
}

// 1. Recognize Ingredients from Photo (Snap-to-Inventory)
app.post('/api/recognize-ingredients', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: '請提供食材照片資料' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: '尚未設定 GEMINI_API_KEY，請確認環境變數。',
      });
    }

    const { mimeType, data } = parseImageData(image);

    const promptText = `
你是一位專業廚師與家庭冰箱食材管理專家。請細心分析這張冰箱、流理台或食材擺放照片。
請列出所有可辨識出的食材，包括蔬菜、肉類、海鮮、蛋奶豆類、水果、澱粉主食、調味品等。
規範：
1. 食材名稱 (name) 必須是簡明清晰的繁體中文名稱（例如：「牛番茄」、「雞胸肉」、「青花菜」、「雞蛋」、「板豆腐」）。
2. 數量 (amount) 請給出合理的估算正整數或小數（若難以計數，預設給 1）。
3. 單位 (unit) 請使用台灣常見食材單位：顆、把、盒、克、根、包、瓶、塊、份、條、袋、片。
4. 分類 (category) 僅限以下之一：蔬菜、肉類、海鮮、蛋奶豆、水果、主食澱粉、調味醬料、其他。
5. 請務必輸出合法的 JSON 物件，嚴格符合指定 schema。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data } },
            { text: promptText },
          ],
        },
      ],
      config: {
        systemInstruction: '你是一個精準的食材視覺辨識分析系統，輸出繁體中文與嚴格 JSON 格式。',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: '照片簡短辨識摘要，例如：辨識出 5 項新鮮食材，包含時蔬與雞胸肉。',
            },
            ingredients: {
              type: Type.ARRAY,
              description: '辨識出的食材列表',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: '食材名稱' },
                  amount: { type: Type.NUMBER, description: '數量估算' },
                  unit: { type: Type.STRING, description: '單位' },
                  category: {
                    type: Type.STRING,
                    description: '分類：蔬菜、肉類、海鮮、蛋奶豆、水果、主食澱粉、調味醬料、其他',
                  },
                },
                required: ['name', 'amount', 'unit', 'category'],
              },
            },
          },
          required: ['ingredients'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error recognizing ingredients:', error);
    return res.status(500).json({
      error: error?.message || '辨識失敗，請重試或上傳更清晰的照片。',
    });
  }
});

// 2. Generate Recipes from Current Inventory & Filters (Supports Single Recipes & Multi-Dish Combos)
app.post('/api/generate-recipes', async (req: Request, res: Response) => {
  try {
    const {
      ingredients = [],
      equipment = ['平底鍋'],
      dietary = [],
      maxTimeMinutes = 30,
      extraNotes = '',
      mode = 'single', // 'single' | 'combo'
    } = req.body;

    if (!ingredients.length) {
      return res.status(400).json({ error: '冰箱中目前沒有食材，請先加入或拍照盤點食材。' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: '尚未設定 GEMINI_API_KEY' });
    }

    const ingredientListText = ingredients
      .map((i: any) => `- ${i.name} (現有量: ${i.amount} ${i.unit}) [${i.category || '食材'}]`)
      .join('\n');

    const promptText =
      mode === 'combo'
        ? `
使用者目前冰箱有以下可用庫存食材：
${ingredientListText}

烹飪限制與偏好條件：
- 可用烹飪設備：${equipment.join(', ') || '不限常用設備'}
- 飲食風格 / 偏好：${dietary.join(', ') || '無特殊限制'}
- 總時間限制：最多 ${maxTimeMinutes} 分鐘
- 額外使用者要求：${extraNotes || '無額外要求，請以清冰箱零浪費、營養均衡為主'}

任務要求 (套餐模式 Multi-dish Combo)：
請為使用者設計 1 個完整的「一湯兩菜」或「一主菜一配菜一湯品」的均衡套餐組合 (combo)，並包含 2 到 3 道互補的菜色 (dishes)：
1. 套餐名稱 (comboTitle) 須清楚吸引人（例：「蒜香黑椒雞配清脆時蔬佐番茄滑蛋豆腐湯」）。
2. 每道菜色 (dishes) 皆需完整填寫使用的冰箱食材 (usedIngredients)、自備常備調味料 (additionalIngredients)、步驟清單 (steps)、各菜色耗時與營養估算。
3. 提供 parallel cooking 排程順序秘訣 (cookingSequenceTips)，指引如何同時煮湯與快炒以節省時間。
4. 計算整套組合的總時間 (totalCookingTimeMinutes)、綜合營養 (combinedNutrition) 與整體冰箱消耗率 (matchPercentage: 0-100)。
5. 同時在 recipes 陣列中提供這幾道菜色供獨立檢視。
6. 請全部使用繁體中文。嚴格按照指定 schema 格式輸出。
`
        : `
使用者目前冰箱有以下可用庫存食材：
${ingredientListText}

烹飪限制與偏好條件：
- 可用烹飪設備：${equipment.join(', ') || '不限常用設備'}
- 飲食風格 / 偏好：${dietary.join(', ') || '無特殊限制'}
- 時間限制：最多 ${maxTimeMinutes} 分鐘
- 額外使用者要求：${extraNotes || '無額外要求，請以清冰箱零浪費、美味營養為主'}

任務要求 (單道菜模式)：
1. 請生成 2 到 3 道截然不同、極具吸引力且可行性高（零浪費原則）的食譜。
2. 必須嚴格使用上述「現有庫存食材」，並清楚指明每道菜預計扣除/消耗的冰箱食材名稱與數量（usedIngredients）。
3. 若需額外家庭常備基本調味品（如鹽、黑胡椒、醬油、食用油、水、大蒜），請歸類於 additionalIngredients。
4. 每道菜步驟（steps）請詳細清楚，按順序編排，方便烹飪時勾選，並為需要時間的步驟註記秒數（timerSeconds，若不需要計時填 0）。
5. 估算冰箱消耗百分比 (matchPercentage: 0-100)，代表這道菜消耗了多少庫存。
6. 提供營養素估計（卡路里、蛋白質、碳水化合物、脂肪）與大廚省時小秘訣 (chefTip)。
7. 請全部使用繁體中文。嚴格按照指定 schema 格式輸出。
`;

    const singleRecipeSchema = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING, description: '菜色名稱' },
        description: { type: Type.STRING, description: '菜色短評與吸引人的特色描述' },
        cookingTimeMinutes: { type: Type.NUMBER, description: '預計耗時分鐘數' },
        difficulty: { type: Type.STRING, description: '難易度：新手友好、簡易、中等' },
        matchPercentage: { type: Type.NUMBER, description: '冰箱食材匹配/消耗比例 (0-100)' },
        dishType: { type: Type.STRING, description: '菜色類別，例：主菜快炒、暖胃湯品、爽口配菜' },
        equipmentUsed: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        usedIngredients: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              unit: { type: Type.STRING },
            },
            required: ['name', 'amount', 'unit'],
          },
        },
        additionalIngredients: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              amount: { type: Type.STRING },
              optional: { type: Type.BOOLEAN },
            },
            required: ['name', 'amount'],
          },
        },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stepNumber: { type: Type.INTEGER },
              title: { type: Type.STRING },
              instruction: { type: Type.STRING },
              timerSeconds: { type: Type.INTEGER },
            },
            required: ['stepNumber', 'title', 'instruction'],
          },
        },
        nutrition: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
          },
          required: ['calories', 'protein', 'carbs', 'fat'],
        },
        chefTip: { type: Type.STRING },
      },
      required: [
        'id',
        'title',
        'description',
        'cookingTimeMinutes',
        'difficulty',
        'matchPercentage',
        'equipmentUsed',
        'usedIngredients',
        'additionalIngredients',
        'steps',
        'nutrition',
        'chefTip',
      ],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction:
          '你是專業的 AI 私廚與惜食料理管家，擅長用冰箱現有食材在短時間內變出美味料理或均衡套餐。輸出必須嚴格為繁體中文 JSON。',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipes: {
              type: Type.ARRAY,
              items: singleRecipeSchema,
            },
            combo: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                comboTitle: { type: Type.STRING },
                description: { type: Type.STRING },
                totalCookingTimeMinutes: { type: Type.NUMBER },
                cookingSequenceTips: { type: Type.STRING },
                matchPercentage: { type: Type.NUMBER },
                combinedNutrition: {
                  type: Type.OBJECT,
                  properties: {
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fat: { type: Type.NUMBER },
                  },
                  required: ['calories', 'protein', 'carbs', 'fat'],
                },
                dishes: {
                  type: Type.ARRAY,
                  items: singleRecipeSchema,
                },
              },
            },
          },
          required: ['recipes'],
        },
      },
    });

    const text = response.text || '{"recipes":[]}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating recipes:', error);
    return res.status(500).json({
      error: error?.message || '生成食譜時發生錯誤，請重試。',
    });
  }
});

// 2.5 Generate Weekly Meal Plan & Identify Shortages
app.post('/api/generate-weekly-plan', async (req: Request, res: Response) => {
  try {
    const { ingredients = [], equipment = ['平底鍋'], dietary = [] } = req.body;
    if (!apiKey) {
      return res.status(500).json({ error: '尚未設定 GEMINI_API_KEY' });
    }

    const ingredientListText = ingredients
      .map((i: any) => `- ${i.name} (${i.amount} ${i.unit}) [${i.category || '食材'}]`)
      .join('\n');

    const promptText = `
使用者現有冰箱庫存如下：
${ingredientListText}
可用設備：${equipment.join(', ')}
飲食風格：${dietary.join(', ')}

任務要求：
請為使用者規劃整週（週一至週日，每日午餐與晚餐，共 14 個餐期）的菜單規劃，盡量在前幾天優先消耗即期食材，並計算為完成全週菜單需要額外採購的食材清單 (missingGroceries)。
輸出格式：
- schedule: 陣列，包含 14 個餐期，每個項目包含 day ('週一' | '週二' | '週三' | '週四' | '週五' | '週六' | '週日'), mealType ('午餐' | '晚餐'), dishTitle, dishType, cookingTimeMinutes, calories, usedFridgeItems (使用到的現有食材名稱陣列)。
- missingGroceries: 陣列，包含為完成全週需要採購的缺少食材清單，每項包含 name (名稱), amount (預計採購數量), unit (單位), category (分類：蔬菜/肉類/海鮮/蛋奶豆/調味醬料/其他), neededForDish (用於哪道菜)。
全部繁體中文輸出。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: '你是全方位家庭每週飲食營養規劃管家，輸出繁體中文 JSON。',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  mealType: { type: Type.STRING },
                  dishTitle: { type: Type.STRING },
                  dishType: { type: Type.STRING },
                  cookingTimeMinutes: { type: Type.NUMBER },
                  calories: { type: Type.NUMBER },
                  usedFridgeItems: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['day', 'mealType', 'dishTitle', 'cookingTimeMinutes', 'calories'],
              },
            },
            missingGroceries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  category: { type: Type.STRING },
                  neededForDish: { type: Type.STRING },
                },
                required: ['name', 'amount', 'unit', 'category'],
              },
            },
          },
          required: ['schedule', 'missingGroceries'],
        },
      },
    });

    const text = response.text || '{"schedule":[],"missingGroceries":[]}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating weekly plan:', error);
    return res.status(500).json({
      error: error?.message || '生成每週菜單失敗，請稍後重試。',
    });
  }
});


// 3. Dynamic Swap Recipe (動態換一道)
app.post('/api/swap-recipe', async (req: Request, res: Response) => {
  try {
    const {
      currentRecipeTitle,
      feedback,
      ingredients = [],
      equipment = ['平底鍋'],
      dietary = [],
    } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: '尚未設定 GEMINI_API_KEY' });
    }

    const ingredientListText = ingredients
      .map((i: any) => `- ${i.name} (現有量: ${i.amount} ${i.unit})`)
      .join('\n');

    const promptText = `
使用者想要換掉原本的菜色「${currentRecipeTitle}」。
使用者的更換理由或附加指令為：「${feedback || '想換個不同做法或口味'}」。

現有冰箱可用庫存食材：
${ingredientListText}

可用設備：${equipment.join(', ') || '平底鍋'}
飲食風格：${dietary.join(', ') || '無'}

請根據上述反饋，重新設計 1 道全新的替代食譜！
請確保滿足使用者提出的要求（例如避開特定不想用的食材、改用其他設備、改成湯品或不同風味）。
使用繁體中文，並嚴格依照指定 schema 格式輸出單一 recipe 物件。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: '你是一位反應靈敏、廚藝多變的大廚。換菜時請完全貼合使用者的意見。',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipe: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                cookingTimeMinutes: { type: Type.NUMBER },
                difficulty: { type: Type.STRING },
                matchPercentage: { type: Type.NUMBER },
                dishType: { type: Type.STRING },
                equipmentUsed: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                usedIngredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                    },
                    required: ['name', 'amount', 'unit'],
                  },
                },
                additionalIngredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      amount: { type: Type.STRING },
                      optional: { type: Type.BOOLEAN },
                    },
                    required: ['name', 'amount'],
                  },
                },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      instruction: { type: Type.STRING },
                      timerSeconds: { type: Type.INTEGER },
                    },
                    required: ['stepNumber', 'title', 'instruction'],
                  },
                },
                nutrition: {
                  type: Type.OBJECT,
                  properties: {
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fat: { type: Type.NUMBER },
                  },
                  required: ['calories', 'protein', 'carbs', 'fat'],
                },
                chefTip: { type: Type.STRING },
              },
              required: [
                'id',
                'title',
                'description',
                'cookingTimeMinutes',
                'difficulty',
                'matchPercentage',
                'equipmentUsed',
                'usedIngredients',
                'additionalIngredients',
                'steps',
                'nutrition',
                'chefTip',
              ],
            },
          },
          required: ['recipe'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error swapping recipe:', error);
    return res.status(500).json({
      error: error?.message || '換菜失敗，請重試。',
    });
  }
});

// 4. Check Custom Menu Missing Ingredients & Provide AI Completion Plan
app.post('/api/check-menu-ingredients', async (req: Request, res: Response) => {
  try {
    const { desiredDish, customMenuText, customDishes = [], ingredients = [], preferences = {} } = req.body;
    const menuInput = (customMenuText || (customDishes.length > 0 ? customDishes.join('、') : desiredDish) || '').trim();

    if (!menuInput) {
      return res.status(400).json({ error: '請輸入您想烹調的菜單或菜色名稱。' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: '尚未設定 GEMINI_API_KEY' });
    }

    const ingredientListText = ingredients
      .map((i: any) => `- ${i.name} (現有量: ${i.amount} ${i.unit}) [${i.category || '食材'}]`)
      .join('\n');

    const promptText = `
使用者輸入了一份自定義菜單 / 料理需求：
「${menuInput}」

使用者目前冰箱現有可用庫存：
${ingredientListText || '（冰箱無食材）'}

設備限制：${(preferences.equipment || ['平底鍋']).join(', ')}
飲食偏好：${(preferences.dietary || []).join(', ') || '無特殊限制'}

請扮演專業主廚與精算庫存管家，執行兩大核心任務：
任務一：【現有庫存比對與缺失食材清單】
1. 分析這份自定義菜單包含的每道菜色（dishesAnalysis）。
2. 全面彙整並統計：
   - totalInStockIngredients：冰箱現有能直接用上的食材與數量。
   - totalMissingIngredients：整桌菜缺少、必須去超市補買的所有食材清單（名稱 name、所需數量 amount、單位 unit、分類 category、用於哪道菜 neededForDish）。
   - overallMatchRate：整份自定義菜單的庫存就緒率 (0-100%)。

任務二：【AI 推薦補齊菜單方案 (completionPlan)】
以「零浪費、最少額外採買負擔、極致活用現有冰箱庫存」為原則，為使用者量身打造一份「AI 推薦的補齊菜單方案」：
1. planTitle: 方案標題（例如：「現有庫存最大化 · 2項缺料神救援補齊方案」）。
2. strategySummary: 說明推薦策略（例如：「您原先想做的濃湯缺少鮮奶油與培根，建議改為利用現有豆腐與番茄做酸甜蛋花湯；主菜保留，如此一來只需補買 1 盒絞肉即可滿足整桌 3 道菜，大幅節省 70% 採買負擔！」）。
3. optimizedDishes: 補齊後的 2~3 道推薦菜色清單（dishTitle, dishType, description, whyChanged, cookingTimeMinutes）。
4. optimizedMissingIngredients: 採用此補齊方案後，真正只需採買的極簡食材清單（name, amount, unit, category）。

請全部使用繁體中文輸出，並嚴格遵循指定 JSON schema。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: '你是全方位智慧主廚與食材比對精算管家，輸出繁體中文 JSON。',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            menuTitle: { type: Type.STRING, description: '自定義菜單名稱或摘要' },
            overallMatchRate: { type: Type.NUMBER, description: '整體庫存滿足率 0-100' },
            dishesAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dishName: { type: Type.STRING },
                  inStock: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  missing: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['dishName', 'inStock', 'missing'],
              },
            },
            totalInStockIngredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                },
                required: ['name', 'amount', 'unit'],
              },
            },
            totalMissingIngredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  category: { type: Type.STRING },
                  neededForDish: { type: Type.STRING },
                },
                required: ['name', 'amount', 'unit', 'category', 'neededForDish'],
              },
            },
            completionPlan: {
              type: Type.OBJECT,
              properties: {
                planTitle: { type: Type.STRING },
                strategySummary: { type: Type.STRING },
                optimizedDishes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dishTitle: { type: Type.STRING },
                      dishType: { type: Type.STRING },
                      description: { type: Type.STRING },
                      whyChanged: { type: Type.STRING },
                      cookingTimeMinutes: { type: Type.NUMBER },
                    },
                    required: ['dishTitle', 'dishType', 'description', 'whyChanged', 'cookingTimeMinutes'],
                  },
                },
                optimizedMissingIngredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                      category: { type: Type.STRING },
                    },
                    required: ['name', 'amount', 'unit', 'category'],
                  },
                },
              },
              required: ['planTitle', 'strategySummary', 'optimizedDishes', 'optimizedMissingIngredients'],
            },
          },
          required: [
            'menuTitle',
            'overallMatchRate',
            'dishesAnalysis',
            'totalInStockIngredients',
            'totalMissingIngredients',
            'completionPlan',
          ],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    // Ensure fallback structure in case of edge cases
    const result = {
      menuTitle: parsed.menuTitle || menuInput,
      overallMatchRate: typeof parsed.overallMatchRate === 'number' ? parsed.overallMatchRate : 50,
      dishesAnalysis: Array.isArray(parsed.dishesAnalysis) ? parsed.dishesAnalysis : [],
      totalInStockIngredients: Array.isArray(parsed.totalInStockIngredients) ? parsed.totalInStockIngredients : [],
      totalMissingIngredients: Array.isArray(parsed.totalMissingIngredients) ? parsed.totalMissingIngredients : [],
      completionPlan: parsed.completionPlan || {
        planTitle: 'AI 智慧庫存優化方案',
        strategySummary: '善用現有冰箱食材，將額外採買降至最低。',
        optimizedDishes: [],
        optimizedMissingIngredients: [],
      },
    };

    return res.json(result);
  } catch (error: any) {
    console.error('Error checking menu ingredients:', error);
    return res.status(500).json({
      error: error?.message || '比對菜單食材時發生錯誤，請稍後重試。',
    });
  }
});

// Setup Vite middlewares for development or serve built files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
