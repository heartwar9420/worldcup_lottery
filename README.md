# 2026 世界盃抽獎系統

## 專案更新紀錄 (Feature Updates & Changes)

本專案已針對面試需求完成以下優化與功能擴充：

### 1. UI 改進

- **[UI 改進]**：後台獎池設定增加輸入驗證，確保名額設定的合理性與即時錯誤回饋。

### 2. 響應式優化

- 全面重構前台與後台的 CSS 配置，導入響應式設計，確保在手機、平板與 PC 桌面均能維持良好的操作體驗。

### 3. 架構遷移與雲端部署

- **[Database]**：將本機 SQLite 遷移至 **Supabase (PostgreSQL)**，實現雲端化資料存取，支援多人同時連線。
- **[Deployment]**：完成 **Vercel** 部署，優化建置腳本，移除了不必要的本機環境檢查以利雲端執行。

---

這是一個以 2026 美加墨世界盃為主題的本機抽獎網站，適合線下活動在單台電腦上執行。參與者可在前台透過輪盤進行抽獎，管理員則可在後台設定一等獎、二等獎、三等獎名額，系統會隨機產生球隊與獎項的對應關係。

## 專案介紹

- 前台抽獎頁：`/`
  - 顯示 48 支世界盃球隊輪盤。
  - 每個瀏覽器工作階段最多可抽 3 次。
  - 一旦中獎，該工作階段即結束。
  - 若後台尚未設定獎池，抽獎按鈕會停用。

- 後台管理頁：`/admin`
  - 管理員登入後可設定獎池。
  - 可設定一等獎、二等獎、三等獎名額。
  - 儲存後會隨機產生球隊與獎項對應。
  - 可查看各獎項設定名額、已抽出名額、剩餘名額。
  - 可重設獎池並清空抽獎工作階段。

- 預設管理員帳號
  - 帳號：`admin`
  - 密碼：`admin`

## 技術棧

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- bcryptjs
- react-custom-roulette

## 開發環境構建

### 1. 安裝 Node.js 與 pnpm

專案指定版本如下：

```bash
node 22.14.0
pnpm 10.32.1
```

若使用 `nvm`，可先切換 Node.js 版本：

```bash
nvm use 22.14.0
```

確認版本：

```bash
node -v
pnpm -v
```

### 2. 安裝相依套件

```bash
pnpm install
```

安裝時會先執行 `pnpm run check-node`，若 Node.js 版本不是 `22.14.0`，安裝會中止。

### 3. 啟動開發伺服器

```bash
pnpm run dev
```

開啟瀏覽器進入：

- 前台抽獎頁：<http://localhost:3000>
- 後台管理頁：<http://localhost:3000/admin>

## 命令及啟動方式

| 指令                  | 用途                                          |
| --------------------- | --------------------------------------------- |
| `pnpm run check-node` | 檢查目前 Node.js 版本是否為 `22.14.0`         |
| `pnpm install`        | 安裝專案相依套件                              |
| `pnpm run dev`        | 啟動開發模式                                  |
| `pnpm run build`      | 建置正式版本                                  |
| `pnpm run start`      | 啟動正式版本伺服器，需先執行 `pnpm run build` |
| `pnpm run lint`       | 執行 ESLint 檢查                              |

正式執行流程：

```bash
pnpm run init-db
pnpm run build
pnpm run start
```

## 環境變數

請在 Vercel 的 Environment Variables 或本機的 `.env` 檔案中設定以下變數：

| 變數                            | 說明                                     |
| ------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase 專案 URL                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 公開 API Key                    |
| `SESSION_SECRET`                | 用於加密 Session 的隨機字串 (可自行生成) |

## 檔案目錄結構

```text
.
├── README.md
├── PRD_WorldCup_Lottery.md
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── tailwind.config.ts
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
└── src
    ├── app
    │   ├── page.tsx
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── admin
    │   │   ├── page.tsx
    │   │   └── login
    │   │       └── page.tsx
    │   └── api
    │       ├── spin
    │       ├── session
    │       ├── prize-pool
    │       └── admin
    ├── components
    │   ├── AdminLoginForm.tsx
    │   ├── AdminPanel.tsx
    │   ├── LotteryPage.tsx
    │   ├── ResultModal.tsx
    │   └── Roulette.tsx
    └── lib
        ├── db.ts
        ├── prize.ts
        ├── session.ts
        └── teams.ts
```

### 主要目錄說明

| 路徑                                     | 說明                               |
| ---------------------------------------- | ---------------------------------- |
| `src/app/page.tsx`                       | 前台抽獎頁入口                     |
| `src/app/admin/page.tsx`                 | 後台管理頁入口                     |
| `src/app/admin/login/page.tsx`           | 後台登入頁                         |
| `src/app/api/spin/route.ts`              | 執行抽獎的 API                     |
| `src/app/api/prize-pool/status/route.ts` | 前台取得獎池狀態的 API             |
| `src/app/api/session/status/route.ts`    | 前台取得目前抽獎工作階段狀態的 API |
| `src/app/api/admin/*`                    | 後台登入、登出、獎池管理 API       |
| `src/components/LotteryPage.tsx`         | 前台抽獎主畫面                     |
| `src/components/Roulette.tsx`            | 世界盃輪盤元件                     |
| `src/components/ResultModal.tsx`         | 抽獎結果彈窗                       |
| `src/components/AdminPanel.tsx`          | 後台獎池設定介面                   |
| `src/lib/db.ts`                          | Supabase 資料庫連線設定            |
| `src/lib/prize.ts`                       | 獎項型別、標籤與欄位工具           |
| `src/lib/session.ts`                     | 抽獎與管理員 Session Cookie        |
| `src/lib/teams.ts`                       | 48 支球隊資料                      |

## 使用流程

1. 設定環境變數 (`.env.local` 或 Vercel Dashboard)。
2. 執行 `pnpm install` 安裝相依套件。
3. 執行 `pnpm run dev` 啟動本機服務。
4. 進入 `/admin`，使用 `admin / admin` 登入。
5. 設定一等獎、二等獎、三等獎名額，儲存並產生隨機對應。
6. 回到 `/` 開始抽獎。
7. 若要讓下一位參與者重新開始，可清除瀏覽器工作階段，或在後台重設獎池以清空所有抽獎工作階段。

## 開發注意事項

- 資料儲存已遷移至 Supabase PostgreSQL，正式環境請確保環境變數設定正確。
- 後台預設帳號僅適合本機活動或開發環境，正式活動前建議調整密碼或登入機制。
- 抽獎次數與中獎狀態由 HTTP Cookie 與 `spin_sessions` 資料表共同維護。
- 抽獎結果由伺服器端 API 決定，前端只負責顯示輪盤動畫與結果。

---

License Note: This project is source-available for interview purposes only. Commercial use is prohibited. Please see [LICENSE.md](LICENSE.md) for details.

授權提示：本專案僅供面試測驗目的使用，禁止商業用途。詳情請參閱 [LICENSE.md](LICENSE.md)。
