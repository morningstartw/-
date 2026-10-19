# 🚀 Vercel 雲端部署完整指南

本專案已為您完整配置好 **Vercel** 雲端部署所需的一切檔案（包含 `vercel.json`、Vercel Serverless Function `/api/index.ts`、Vite 靜態資產構建與重定向規則）。

只要完成以下步驟，就能在 3 分鐘內將「AI 智慧冰箱食材食譜推薦 APP」部署上線！

---

## 📌 部署前準備：取得 Gemini API Key

本應用的核心多模態照片辨識與智慧食譜生成依賴 Google Gemini API：
1. 前往 [Google AI Studio (https://aistudio.google.com/)](https://aistudio.google.com/)。
2. 點擊 **Get API key** 並建立一組新的 API 金鑰。
3. 複製金鑰備用。

---

## 方式一：透過 GitHub 與 Vercel 網頁後台部署（推薦，最簡單）

### 步驟 1：將程式碼推送至 GitHub
1. 在 GitHub 上建立一個新的儲存庫（Repository，例如 `smart-fridge-app`）。
2. 在本地專案終端機執行：
   ```bash
   git init
   git add .
   git commit -m "feat: setup vercel deployment & dark mode"
   git branch -M main
   git remote add origin https://github.com/您的帳號/smart-fridge-app.git
   git push -u origin main
   ```

### 步驟 2：在 Vercel 匯入專案
1. 登入 [Vercel 官方網站 (https://vercel.com)](https://vercel.com)。
2. 點擊右上角的 **"Add New..."** ➔ **"Project"**。
3. 選擇剛剛建立的 GitHub 儲存庫，點擊 **"Import"**。

### 步驟 3：設定環境變數（重要！）
在 Vercel 的專案設定頁面（Configure Project）：
1. **Framework Preset**：系統會自動識別為 **Vite**。
2. **Build Command**：`vite build`（預設即可）。
3. **Output Directory**：`dist`（預設即可）。
4. 展開 **"Environment Variables"** 區塊：
   * **Key**: `GEMINI_API_KEY`
   * **Value**: 貼上您剛剛在 Google AI Studio 取得的 Gemini API Key。
5. 點擊 **"Add"** 新增環境變數。

### 步驟 4：點擊 Deploy 部署
1. 點擊底部的 **"Deploy"** 按鈕。
2. 等待約 30~60 秒，Vercel 就會自動編譯前端並佈署 Serverless API。
3. 部署完成後，您即可獲得專屬的免費線上網址（例如：`https://smart-fridge-app.vercel.app`）！

---

## 方式二：使用 Vercel CLI 終端機快速部署

如果您習慣使用命令列工具：

1. 全域安裝 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 登入 Vercel：
   ```bash
   vercel login
   ```

3. 執行部署指令：
   ```bash
   vercel
   ```
   * 按照提示確認專案名稱與目錄（一律按 Enter 選擇預設值即可）。

4. 設定生產環境變數：
   ```bash
   vercel env add GEMINI_API_KEY
   # 提示時輸入您的 Gemini API Key，並選擇 Production / Preview / Development
   ```

5. 部署至正式生產環境 (Production)：
   ```bash
   vercel --prod
   ```

---

## 🔍 架構說明與常見問題

### Q1: API 端點在 Vercel 上是如何運作的？
* 專案內已建立 `vercel.json` 與 `/api/index.ts`。
* 當使用者造訪 `/api/recognize-ingredients`、`/api/generate-recipes` 或 `/api/check-menu-ingredients` 時，Vercel 會自動以 Node.js Serverless Function 處理請求。
* 不需要另外架設 Express 伺服器或負載平衡器。

### Q2: 提示「尚未設定 GEMINI_API_KEY」怎麼辦？
* 請前往 Vercel 控制台 ➔ 選擇您的專案 ➔ **Settings** ➔ **Environment Variables**。
* 確認有新增 `GEMINI_API_KEY`，並且勾選了 **Production**、**Preview** 與 **Development**。
* 新增變數後，請至 **Deployments** 分頁點擊 **"Redeploy"** 重新發布生效。

### Q3: 冰箱照片上傳辨識會逾時嗎？
* 我們已在 `vercel.json` 中將 API 超時時間延長為 60 秒 (`maxDuration: 60`)，記憶體配置為 1024MB，足夠處理多模態照片分析與複雜食譜運算。
