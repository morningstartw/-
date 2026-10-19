import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

export const app = express();

// Body parsing with 20MB limit for image uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const router = express.Router();

// Health check endpoint for deployment monitoring
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'AI 智慧冰箱與食譜助理 API',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'AI 智慧冰箱與食譜助理 API',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Initialize Gemini Client helper (fresh per call or cached, using process.env.GEMINI_API_KEY)
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return {
    apiKey,
    ai: new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    }),
  };
}

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

// Robust generateContent helper with automatic fallback if primary model experiences high load (503/429)
async function generateWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    preferredModel?: string;
  }
) {
  const primaryModel = params.preferredModel || 'gemini-3.8-flash';
  const fallbackModel = 'gemini-flash-latest';

  try {
    return await ai.models.generateContent({
      model: primaryModel,
      contents: params.contents,
      config: params.config,
    });
  } catch (err: any) {
    const errMsg = err?.message || '';
    if (
      errMsg.includes('503') ||
      errMsg.includes('high demand') ||
      errMsg.includes('UNAVAILABLE') ||
      errMsg.includes('429') ||
      errMsg.includes('RESOURCE_EXHAUSTED')
    ) {
      console.warn(`Model ${primaryModel} busy/unavailable. Falling back to ${fallbackModel}...`);
      return await ai.models.generateContent({
        model: fallbackModel,
        contents: params.contents,
        config: params.config,
      });
    }
    throw err;
  }
}

// User-friendly error message cleaner
function formatErrorMessage(error: any, defaultMessage: string): string {
  if (!error) return defaultMessage;
  const rawMsg = error.message || String(error);
  if (rawMsg.includes('GEMINI_API_KEY') || rawMsg.includes('API key')) {
    return '尚未設定或無效的 GEMINI_API_KEY，請確認環境變數。';
  }
  if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
    return '目前 AI 伺服器忙碌中，請稍候 5 秒後重試。';
  }
  if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
    return 'API 呼叫頻率已達上限，請稍後再試。';
  }
  return defaultMessage;
}

// 1. Recognize Ingredients from Photo (Snap-to-Inventory)
router.post('/recognize-ingredients', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: '請提供食材照片資料' });
    }

    const { apiKey, ai } = getGeminiClient();
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

    const response = await generateWithFallback(ai, {
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
                  confidence: {
                    type: Type.NUMBER,
                    description: '辨識信心度 0.1 ~ 1.0',
                  },
                  estimatedExpiryDays: {
                    type: Type.NUMBER,
                    description: '建議保存剩餘天數 (預設例如葉菜3天、肉品2天、根莖7天)',
                  },
                },
                required: ['name', 'amount', 'unit', 'category', 'confidence'],
              },
            },
          },
          required: ['summary', 'ingredients'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in recognize-ingredients:', error);
    return res.status(500).json({
      error: formatErrorMessage(error, '辨識過程中發生錯誤，請稍後重試。'),
    });
  }
});

// 2. Generate Recipes (Single or Combo Meal)
router.post('/generate-recipes', async (req: Request, res: Response) => {
  try {
    const {
      ingredients = [],
      equipment = [],
      dietary = [],
      maxTimeMinutes = 30,
      extraNotes = '',
      mode = 'combo',
    } = req.body;

    const { apiKey, ai } = getGeminiClient();
    if (!apiKey) {
      return res.status(500).json({ error: '尚未設定 GEMINI_API_KEY' });
    }

    const availableListStr = ingredients
      .map(
        (i: any) =>
          `- ${i.name}: ${i.amount}${i.unit} (類別: ${i.category}, 保存倒數: ${i.expiryDays}天)`
      )
      .join('\n');

    const equipmentStr = equipment.length > 0 ? equipment.join('、') : '通用平底鍋、電鍋、一般瓦斯爐';
    const dietaryStr = dietary.length > 0 ? dietary.join('、') : '無特殊限制';

    const promptText = `
你是一位米其林級主廚兼家庭剩食管理專家。
使用者冰箱中有以下現有庫存食材：
${availableListStr || '目前無食材記錄，請以常見家常食材出發'}

【使用者的設備與篩選限制】
- 可用設備：${equipmentStr}
- 飲食偏好與禁忌：${dietaryStr}
- 料理時間上限：${maxTimeMinutes} 分鐘
${extraNotes ? `- 特殊需求或使用者備註：${extraNotes}` : ''}
- 生成模式：${mode === 'combo' ? '整套均衡餐點組合（Combo: 一湯一菜或兩菜一湯）' : '單道精選食譜 (Single)'}

【核心要求】
1. 嚴格遵守設備限制（例如使用者若只選「電鍋」，絕不能需要瓦斯爐爆炒！）。
2. 優先消耗即將到期（保存天數少）的食材，達成「零浪費食材減法」。
3. 標明每道菜所使用的庫存食材（名稱、扣除數量、單位）與若需要額外採買的次要食材。
4. 每道菜提供詳細烹飪步驟（包含時間預估）與主廚小秘訣 (chefTip)。
5. 請以合法的 JSON 格式輸出，符合 schema。
`;

    const response = await generateWithFallback(ai, {
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        systemInstruction: '你是一位注重健康、效率與零浪費的專業廚神 AI，專門將現有冰箱剩食轉換成令人垂涎的美食。輸出繁體中文與嚴格 JSON。',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mode: { type: Type.STRING },
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  cookingTimeMinutes: { type: Type.NUMBER },
                  difficulty: { type: Type.STRING, description: '新手友善 / 中等 / 進階' },
                  matchPercentage: { type: Type.NUMBER, description: '庫存食材吻合率 (0-100)' },
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
                        amount: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                      },
                      required: ['name', 'amount', 'unit'],
                    },
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        stepNumber: { type: Type.NUMBER },
                        title: { type: Type.STRING },
                        instruction: { type: Type.STRING },
                        timerSeconds: { type: Type.NUMBER },
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
            comboRecommendation: {
              type: Type.OBJECT,
              properties: {
                comboTitle: { type: Type.STRING, description: '例如：極速 15 分鐘蛋白質滿點雙菜組' },
                description: { type: Type.STRING },
                totalEstimatedTimeMinutes: { type: Type.NUMBER },
                totalCalories: { type: Type.NUMBER },
                totalProtein: { type: Type.NUMBER },
                synergyTips: { type: Type.STRING, description: '多道菜同時烹調的省時省瓦斯策略' },
              },
            },
          },
          required: ['recipes'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating recipes:', error);
    return res.status(500).json({
      error: formatErrorMessage(error, '生成食譜時發生錯誤，請稍後重試。'),
    });
  }
});

// 3. Dynamic Recipe Swapping (動態換菜微調)
router.post('/swap-recipe', async (req: Request, res: Response) => {
  try {
    const {
      oldRecipeTitle,
      userFeedback,
      availableIngredients = [],
      equipment = [],
      dietary = [],
    } = req.body;

    const { apiKey, ai } = getGeminiClient();
    if (!apiKey) {
      return res.status(500).json({ error: '尚未設定 GEMINI_API_KEY' });
    }

    const availableListStr = availableIngredients
      .map((i: any) => `- ${i.name}: ${i.amount}${i.unit}`)
      .join('\n');

    const promptText = `
使用者想要替換原本的食譜：「${oldRecipeTitle}」。
使用者的微調換菜需求是：「${userFeedback || '換另一種不同作法但同樣好吃的菜色'}」。

【冰箱可用食材】
${availableListStr}

【設備與限制】
- 設備：${equipment.join('、') || '通用'}
- 偏好：${dietary.join('、') || '無'}

請重新構思並生成「完全不同的一道新食譜」，嚴格滿足以使用者回饋為核心的調整，並維持最大化使用現有庫存。
以合法 JSON 格式輸出符合 schema。
`;

    const response = await generateWithFallback(ai, {
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        systemInstruction: '你是一位精準理解使用者換菜需求並即時調整食譜的廚房對話助理。輸出繁體中文與嚴格 JSON。',
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
                      amount: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                    },
                    required: ['name', 'amount', 'unit'],
                  },
                },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.NUMBER },
                      title: { type: Type.STRING },
                      instruction: { type: Type.STRING },
                      timerSeconds: { type: Type.NUMBER },
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
      error: formatErrorMessage(error, '換菜失敗，請重試。'),
    });
  }
});

// 4. Check Custom Menu Missing Ingredients & Provide AI Completion Plan
router.post('/check-menu-ingredients', async (req: Request, res: Response) => {
  try {
    const { desiredDish, customMenuText, customDishes = [], ingredients = [], preferences = {} } = req.body;
    const menuInput = (customMenuText || (customDishes.length > 0 ? customDishes.join('、') : desiredDish) || '').trim();

    if (!menuInput) {
      return res.status(400).json({ error: '請輸入您想烹調的菜單或菜色名稱。' });
    }

    const { apiKey, ai } = getGeminiClient();
    if (!apiKey) {
      return res.status(500).json({ error: '尚未設定 GEMINI_API_KEY' });
    }

    const availableListStr = ingredients
      .map(
        (i: any) =>
          `- ${i.name}: ${i.amount}${i.unit} (類別: ${i.category || '一般'})`
      )
      .join('\n');

    const promptText = `
使用者想要自行規劃煮一道或整桌菜單：
【使用者自定義菜單輸入】：
"${menuInput}"

【目前冰箱現有庫存食材】：
${availableListStr || '目前無庫存食材'}

【廚房可用設備】：${(preferences.equipment || ['平底鍋', '電鍋', '瓦斯爐']).join('、')}
【飲食習慣限制】：${(preferences.dietary || ['無特殊限制']).join('、')}

請作為專業主廚兼智慧食材分析專家，完成以下三大核心任務：

1. 【菜單拆解與食材需求比對】：
   - 識別使用者想煮的每道菜色。
   - 分析每道菜所需的標準食材與配料。
   - 逐一比對現有庫存：哪些是「現有在庫 (inStockIngredients)」？哪些是「目前缺少 (missingIngredients)」？
   - 計算該菜單的「庫存吻合度比率 overallMatchRate」(0 ~ 100%)。
   - 統整整桌菜單的總缺少食材清單 (totalMissingIngredients)，並標註每樣缺少食材是為了哪一道菜 (neededForDish) 及建議採買量與單位。

2. 【AI 智慧補齊與調整方案 (completionPlan)】：
   - 針對缺少的食材，提出極具創意的「聰明替代 / 庫存最大化」補齊菜單方案！
   - 例如：如果使用者想煮「三杯雞、蒜炒高麗菜」，但缺少雞肉卻有豆腐，方案可建議將三杯雞微調為「三杯百頁豆腐」或利用現有庫存組合出美味互補的 2~3 道菜。
   - 說明此優化方案的策略摘要 (strategySummary)，例如：「利用現有九層塔與蒜頭，將缺乏的肉品改以庫存雞蛋與豆腐替代，達成 0 採買即可出菜」。
   - 提供優化調整後的菜色 (optimizedDishes)，包含菜名、簡介、預估時間、主要運用到的庫存食材、以及調整的原因亮點 (whyChanged)。
   - 列出在此優化方案下，使用者「真正還需要採買的極簡缺料 (optimizedMissingIngredients)」（如果全部可用現有庫存解決，此清單可為空陣列或極少項目！）。

請嚴格輸出合法 JSON，符合指定 schema。
`;

    const response = await generateWithFallback(ai, {
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        systemInstruction: '你是一位精通食材庫存調度、食材替代與菜單設計的專業大廚。輸出繁體中文與嚴格 JSON 格式。',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            menuTitle: { type: Type.STRING, description: '菜單總覽標題' },
            overallMatchRate: { type: Type.NUMBER, description: '整桌菜單現有庫存吻合度 (0-100)' },
            dishesAnalysis: {
              type: Type.ARRAY,
              description: '每道菜的個別盤點分析',
              items: {
                type: Type.OBJECT,
                properties: {
                  dishName: { type: Type.STRING },
                  dishMatchRate: { type: Type.NUMBER },
                  inStockIngredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                      },
                      required: ['name'],
                    },
                  },
                  missingIngredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                        category: { type: Type.STRING },
                      },
                      required: ['name', 'amount', 'unit'],
                    },
                  },
                  substitutionTips: { type: Type.STRING, description: '替代方案建議' },
                },
                required: ['dishName', 'dishMatchRate', 'inStockIngredients', 'missingIngredients'],
              },
            },
            totalInStockIngredients: {
              type: Type.ARRAY,
              description: '整桌菜單共用到的庫存食材清單',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                },
                required: ['name'],
              },
            },
            totalMissingIngredients: {
              type: Type.ARRAY,
              description: '整桌菜單缺少的食材彙整',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  category: { type: Type.STRING },
                  neededForDish: { type: Type.STRING },
                },
                required: ['name', 'amount', 'unit'],
              },
            },
            completionPlan: {
              type: Type.OBJECT,
              description: 'AI 推薦的補齊與庫存優化方案',
              properties: {
                planTitle: { type: Type.STRING, description: '方案標題，例如：低浪費·庫存活化 3 道菜補齊方案' },
                strategySummary: { type: Type.STRING, description: '策略說明與調整亮點' },
                optimizedDishes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      cookingTimeMinutes: { type: Type.NUMBER },
                      usedInventoryHighlights: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      whyChanged: { type: Type.STRING, description: '為何這樣微調或推薦' },
                    },
                    required: ['name', 'cookingTimeMinutes', 'whyChanged'],
                  },
                },
                optimizedMissingIngredients: {
                  type: Type.ARRAY,
                  description: '採用此優化方案後，額外只需採買的極簡缺料',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                      category: { type: Type.STRING },
                    },
                    required: ['name', 'amount', 'unit'],
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
      error: formatErrorMessage(error, '比對菜單食材時發生錯誤，請稍後重試。'),
    });
  }
});

// Mount router on both /api and root / for seamless local dev & Vercel serverless routing
app.use('/api', router);
app.use('/', router);

export default app;
