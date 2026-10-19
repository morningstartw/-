import React, { useState } from 'react';
import {
  X,
  Rocket,
  CheckCircle2,
  Copy,
  ExternalLink,
  Key,
  Terminal,
  Sparkles,
  ShieldCheck,
  Check,
  FileCode,
  Globe,
} from 'lucide-react';

interface VercelDeployModalProps {
  onClose: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cli'>('dashboard');

  const handleCopyEnvKey = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('GEMINI_API_KEY');
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyCliCommand = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('npm i -g vercel && vercel');
      setCopiedCli(true);
      setTimeout(() => setCopiedCli(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs font-black text-base">
              ▲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
                  Vercel 雲端部署設定就緒
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                  Ready to Deploy
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                本專案已自動配置 vercel.json 與 Serverless API，可一鍵佈署至 Vercel
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Status checklist pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">vercel.json 配置</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">已自動綁定 Vite 與 API 路由重寫</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Serverless 函數</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">/api 端點支援多模態與 60s 超時</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">零設定跨域相容</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">前端與 API 同源，免 CORS 設定</p>
              </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>方式一：GitHub + Vercel 網頁匯入（推薦）</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cli')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeTab === 'cli'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>方式二：Vercel CLI 命令列</span>
            </button>
          </div>

          {activeTab === 'dashboard' ? (
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    推送到 GitHub 儲存庫
                  </h4>
                </div>
                <p className="text-slate-600 dark:text-slate-300 pl-7">
                  將本專案目錄推送至您自己的 GitHub Repository（包含 <code>vercel.json</code> 與 <code>api/</code>）。
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    在 Vercel 點擊「Add New... ➔ Project」匯入
                  </h4>
                </div>
                <p className="text-slate-600 dark:text-slate-300 pl-7">
                  選擇剛剛的 GitHub Repository，系統會自動辨識為 <b>Vite</b> 專案，無需修改建置設定。
                </p>
              </div>

              {/* Step 3: Crucial Environment Variable */}
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[11px] flex items-center justify-center">
                      3
                    </span>
                    <h4 className="font-bold text-amber-950 dark:text-amber-200 text-sm flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      設定環境變數：GEMINI_API_KEY（核心關鍵）
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEnvKey}
                    className="px-2.5 py-1 text-xs rounded-lg font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/80 flex items-center gap-1 transition-colors"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? '已複製' : '複製變數名稱'}</span>
                  </button>
                </div>
                <div className="pl-7 space-y-2 text-slate-600 dark:text-slate-300">
                  <p>
                    在 Vercel 部署頁面展開 <b>Environment Variables</b>：
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] flex items-center justify-between">
                    <span>Key: <b>GEMINI_API_KEY</b></span>
                    <span className="text-slate-400">Value: 您的 Gemini API Key</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    💡 若尚未取得 Key，可免費前往{' '}
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 underline font-bold inline-flex items-center gap-0.5"
                    >
                      Google AI Studio <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    建立。
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[11px] flex items-center justify-center">
                    4
                  </span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    按下「Deploy」等待約 30 秒即刻上線！
                  </h4>
                </div>
                <p className="text-slate-600 dark:text-slate-300 pl-7">
                  Vercel 會自動分配一組免費的 <code>*.vercel.app</code> 網址，支援自訂域名與全自動 SSL 憑證。
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-sans font-bold">Vercel CLI 快速指令：</span>
                  <button
                    type="button"
                    onClick={handleCopyCliCommand}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copiedCli ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCli ? '已複製' : '複製指令'}</span>
                  </button>
                </div>
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
{`# 1. 安裝 Vercel CLI
npm i -g vercel

# 2. 登入
vercel login

# 3. 部署專案
vercel

# 4. 新增 Gemini API Key 環境變數
vercel env add GEMINI_API_KEY

# 5. 正式發布 (Production)
vercel --prod`}
                </pre>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                專案中已內附 <code>DEPLOY_VERCEL.md</code> 完整說明檔案，隨時可於專案根目錄查閱。
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>含 vercel.json、.vercelignore 與 api/index.ts</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-extrabold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-xs"
            >
              <span>前往 Vercel 建立專案</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
