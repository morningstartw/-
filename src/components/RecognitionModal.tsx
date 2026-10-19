import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { DetectedIngredient, IngredientCategory } from '../types';
import { DEMO_FRIDGE_PHOTOS } from '../data/mockData';

interface RecognitionModalProps {
  onConfirm: (ingredients: DetectedIngredient[]) => void;
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

const UNITS = ['顆', '把', '盒', '克', '根', '包', '塊', '瓶', '份', '條', '袋', '片'];

export const RecognitionModal: React.FC<RecognitionModalProps> = ({
  onConfirm,
  onClose,
}) => {
  const [stage, setStage] = useState<'upload' | 'analyzing' | 'review'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<DetectedIngredient[]>([]);
  const [recognitionSummary, setRecognitionSummary] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload from file or camera
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      processImageRecognition(result);
    };
    reader.readAsDataURL(file);
  };

  // Handle one-click sample photo
  const handleSelectDemoPhoto = (photo: typeof DEMO_FRIDGE_PHOTOS[0]) => {
    setImagePreview(photo.url);
    setStage('analyzing');
    setErrorMsg(null);

    // Call server API or fallback to pre-tagged demo items
    fetch('/api/recognize-ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: photo.url }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('API 回應異常');
        }
        return res.json();
      })
      .then((data) => {
        if (data.ingredients && data.ingredients.length > 0) {
          setDetectedItems(data.ingredients);
          setRecognitionSummary(data.summary || `成功辨識出 ${data.ingredients.length} 項食材！`);
        } else {
          setDetectedItems(photo.ingredients);
          setRecognitionSummary(`已辨識出 ${photo.ingredients.length} 項新鮮食材！`);
        }
        setStage('review');
      })
      .catch((_err) => {
        setDetectedItems(photo.ingredients);
        setRecognitionSummary(`已辨識出 ${photo.ingredients.length} 項新鮮食材！`);
        setStage('review');
      });
  };

  // Send photo to backend for Gemini Vision analysis
  const processImageRecognition = async (base64Img: string) => {
    setStage('analyzing');
    setErrorMsg(null);

    try {
      const response = await fetch('/api/recognize-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Img }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '影像辨識失敗，請重試或上傳其他照片。');
      }

      const data = await response.json();
      if (!data.ingredients || data.ingredients.length === 0) {
        throw new Error('未在照片中辨識出足夠食材，請改由手動補充或換張更清晰的照片。');
      }

      setDetectedItems(data.ingredients);
      setRecognitionSummary(data.summary || `成功辨識出 ${data.ingredients.length} 項食材！`);
      setStage('review');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '辨識發生錯誤');
      setStage('review');
    }
  };

  // Stepper / list modification
  const updateItem = (index: number, updated: Partial<DetectedIngredient>) => {
    setDetectedItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...updated } : item))
    );
  };

  const removeItem = (index: number) => {
    setDetectedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addNewItem = () => {
    setDetectedItems((prev) => [
      ...prev,
      {
        name: '新食材',
        amount: 1,
        unit: '顆',
        category: '蔬菜',
      },
    ]);
  };

  const handleConfirmAndAdd = () => {
    const validItems = detectedItems.filter((i) => i.name.trim() && i.amount > 0);
    if (validItems.length === 0) {
      alert('請至少保留一項有效食材！');
      return;
    }
    onConfirm(validItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
                {stage === 'review' ? '確認辨識結果與數量' : '照片辨識一鍵盤點'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {stage === 'review'
                  ? '請核對並調整 AI 估算結果，隨時增修品名與數量'
                  : '拍攝冰箱或上傳照片，AI 自動框選盤點現有食材'}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 text-sm">
          {/* STAGE 1: UPLOAD / SNAP */}
          {stage === 'upload' && (
            <div className="space-y-6">
              {/* Photo capture triggers */}
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">開啟相機拍照</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">即時拍攝冰箱內層</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">從相簿上傳</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">支援手機相簿或圖檔</span>
                </button>
              </div>

              {/* Demo sample photos */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    或是點選以下冰箱情境範例圖快速體驗：
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {DEMO_FRIDGE_PHOTOS.map((demo) => (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => handleSelectDemoPhoto(demo)}
                      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all text-left bg-white dark:bg-slate-800"
                    >
                      <div className="h-24 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                        <img
                          src={demo.url}
                          alt={demo.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                        <span className="absolute bottom-1.5 left-2 text-xs font-bold text-white drop-shadow-sm">
                          {demo.name}
                        </span>
                      </div>
                      <div className="p-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {demo.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs border border-slate-100 dark:border-slate-750">
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  小撇步：拍照時光線充足、食材盡量攤開平放，AI 視覺模型能更精準估算份量與種類。辨識後皆可自由修改增刪！
                </p>
              </div>
            </div>
          )}

          {/* STAGE 2: ANALYZING ANIMATION */}
          {stage === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                  <Sparkles className="w-10 h-10 animate-spin duration-3000 text-emerald-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Loader2 className="w-3 h-3 text-white animate-spin" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  AI 多模態視覺辨識中...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  正在盤點照片中的蔬菜、肉品、調味料與粗估數量...
                </p>
              </div>

              {imagePreview && (
                <div className="w-44 h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative mt-2 opacity-80">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                </div>
              )}
            </div>
          )}

          {/* STAGE 3: REVIEW CONFIRMATION */}
          {stage === 'review' && (
            <div className="space-y-4">
              {/* Top Photo & Summary Card */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-750">
                {imagePreview && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>辨識完成</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {recognitionSummary || `共辨識出 ${detectedItems.length} 項食材，可自由調整下方數值。`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStage('upload');
                    setImagePreview(null);
                  }}
                  className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>重新拍照</span>
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Editable Ingredients Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 px-1">
                  <span>辨識結果清單 ({detectedItems.length})</span>
                  <span className="text-slate-400 dark:text-slate-500 font-normal">可直接點擊名稱或數量修改</span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {detectedItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-2xs"
                    >
                      {/* Name input */}
                      <input
                        type="text"
                        value={item.name}
                        placeholder="食材名稱"
                        onChange={(e) => updateItem(index, { name: e.target.value })}
                        className="flex-1 min-w-[90px] px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:border-emerald-500"
                      />

                      {/* Category selector */}
                      <select
                        value={item.category}
                        onChange={(e) =>
                          updateItem(index, { category: e.target.value as IngredientCategory })
                        }
                        className="w-20 px-1.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>

                      {/* Stepper (- [1] +) */}
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 overflow-hidden shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            updateItem(index, {
                              amount: Math.max(0.5, Number((item.amount - (item.amount > 1 ? 1 : 0.5)).toFixed(1))),
                            })
                          }
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          step="0.5"
                          min="0.1"
                          value={item.amount}
                          onChange={(e) =>
                            updateItem(index, { amount: parseFloat(e.target.value) || 1 })
                          }
                          className="w-10 text-center bg-transparent py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateItem(index, {
                              amount: Number((item.amount + 1).toFixed(1)),
                            })
                          }
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Unit dropdown */}
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(index, { unit: e.target.value })}
                        className="w-14 px-1 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="移除此食材"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add missing item button */}
                <button
                  type="button"
                  onClick={addNewItem}
                  className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>手動補充遺漏食材</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        {stage === 'review' && (
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              共計 <b className="text-slate-800 dark:text-slate-200">{detectedItems.length}</b> 項食材
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmAndAdd}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>確認並加入冰箱</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
