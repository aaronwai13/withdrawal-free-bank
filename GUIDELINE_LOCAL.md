# My Local App Recipe for AI

呢份文件係我私人用嘅本地 app 開發 recipe。
目的唔係追求通用工程最佳實踐，而係令 AI 用接近我現有純前端 app 嘅方式去修改舊 app / 建新 app。

除非我明確要求，否則優先跟呢份 recipe，而唔好自行升級去 React、Next.js、TypeScript、bundler、後端、登入系統或者其他更重方案。

---

## 1. 核心原則

- 優先做出可直接使用、可直接部署、可直接睇明嘅 app
- 優先保持原生 HTML + CSS + JavaScript
- 保持零 build step 為預設
- 小型 app 優先單頁結構
- 設計要有審美，但唔好變成花巧 demo
- 修改現有 app 時，優先延續原有結構、資料流同視覺語言

---

## 2. Default Stack

新 app 預設使用：

- 單頁 `index.html`
- 原生 HTML + CSS + JavaScript
- 無 build step
- 可直接靜態托管
- 如需手機主畫面使用，加 `manifest.json` + `sw.js`
- 如需本地資料保存，優先用 `localStorage`

預設檔案結構：

```text
project/
├── index.html
├── manifest.json
└── sw.js
```

唔需要 `package.json`。
唔需要 `npm install`。
唔需要 build pipeline。

---

## 3. Do Not Overengineer

除非我明確要求，否則不要：

- 引入 npm / pnpm / yarn
- 加 bundler
- 改用 TypeScript
- 改做 React / Vue / Next.js
- 加後端 API
- 加登入系統
- 為咗所謂可擴展性而重寫成大架構

如果依家個 app 已經可以用，而且只係做小幅功能修改，應優先小改而唔係重構。

---

## 4. 什麼情況適合這套 Recipe

呢套 recipe 特別適合：

- 個人工具
- 小型 directory / guide / compare app
- calculator / utility
- 本地 tracker
- 本地 vocab / notes / lookup 工具
- 無後端需求
- 無登入需求
- 想快速完成並直接部署

如果係以下情況，先可以提出偏離呢套 recipe：

- 我明確要求用框架
- 畫面 / 狀態已經複雜到單頁明顯難維護
- 需要多人長期協作
- 有大量重用元件
- 資料量大到 `localStorage` 明顯唔夠用

即使要升級，都要先講清楚原因同代價。

---

## 5. When Editing Existing Apps

如果係修改現有 app：

- 先理解現有結構、命名、資料流、互動方式、UI 風格
- 優先延續原本做法
- 唔好為咗整齊而硬拆成框架式架構
- 唔好隨便改動已經運作良好嘅 interaction pattern
- 改動應盡量細、準、可預測
- 只喺維護成本已經明顯太高時先建議拆檔或重構

如果要偏離原本方向，先解釋點解原做法已經唔夠用。

---

## 6. Escalation Rules

預設單檔。

只有當出現以下情況，先建議拆成 `styles.css` / `app.js`：

- `index.html` 已經太長，改動風險高
- CSS 已經大到難以閱讀
- JavaScript 邏輯已經難追
- 本地資料流程愈來愈多
- modal / tab / filter / CRUD 已經互相牽連得太緊
- 我明確表示想提升可維護性

即使拆檔，都仍然優先保持：

- 無 build step
- 原生 JavaScript
- 可直接靜態部署

拆檔順序優先：

1. 先拆 `app.js`
2. 再拆 `styles.css`
3. 最後先考慮更重方案

---

## 7. Local Data Defaults

如果 app 有本地互動資料，預設用 `localStorage`。

適用情況：

- 詞庫
- 個人設定
- 小量記錄
- 本地 checklist / tracker
- 簡單收藏 / 狀態保存

常見模式：

- `const STORAGE_KEY = 'app_name_v1'`
- 頁面載入時 `loadData()`
- 每次新增 / 修改 / 刪除後 `saveData()`
- 如冇本地資料，回退到 `DEFAULT_DATA`

典型流程：

```js
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  data = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
```

如果資料量明顯變大、查詢變複雜，先考慮 `IndexedDB`。
除非我明確要求，否則唔好主動升級到 `IndexedDB`。

---

## 8. Static Data Defaults

如果 app 主要係展示型內容，預設用寫死常數資料：

- `const DATA = [...]`
- `const CONFIG = {...}`
- `const TABS = [...]`
- `const LOGOS = {...}`

適用於：

- 銀行 / 卡片指南
- 比較表
- FAQ / 教學
- 目錄 / 清單
- 小型 lookup app

如果只係內容更新，優先直接改常數資料，而唔好設計 CMS 式結構。

---

## 9. Local CRUD Pattern

如果 app 係本地可編輯型工具，優先用簡單 CRUD pattern：

- 列表 render
- `Add` 區塊 / page
- `Edit` modal
- `Delete` confirm
- 修改後即時重新 render
- 成功後用 toast feedback

常見流程：

1. `loadData()`
2. `renderList()`
3. 用表單新增資料
4. 用 modal 編輯現有資料
5. 每次變更後 `saveData()`
6. 再 `renderList()`

如果 app 已經有明確 tab 結構，優先沿用 tab workflow，而唔好改成多頁 routing。

---

## 10. Naming Conventions

### 檔案

- 全部小寫 kebab-case
- 預設檔名：`index.html`、`sw.js`、`manifest.json`

### CSS

- 組件類用語意命名：`.card`、`.chip`、`.word-card`、`.bank-card`
- 狀態類用：`.active`、`.show`、`.open`
- 除非動態生成 HTML，否則盡量避免大量 inline style

### JavaScript

- HTML `onclick` 直接用到嘅函數掛 `window`
- 內部函數用 camelCase
- 靜態資料常數用大寫：`DEFAULT_DATA`、`TABS`、`LOGOS`
- 本地儲存 key 用大寫常數：`STORAGE_KEY`

### App 名稱

- `<title>` 同 `manifest.json.name` 用完整名稱
- `manifest.json.short_name` 用 2 至 4 字

---

## 11. Design Taste

我偏好嘅 app 風格：

- 精緻、克制、有設計感
- 唔似企業 dashboard
- 唔似 generic SaaS template
- 唔似 AI 自動生成 landing page
- 手機優先，但 desktop 都要順眼
- 一頁內盡量完成主要任務
- 內容層次清楚，但唔好過度堆疊

視覺方向可以參考：

- editorial utility
- boutique app feeling
- calm, polished, slightly premium

避免：

- 紫白預設配色
- 過重 dashboard 感
- 太多冇意義卡片
- 過多動畫
- 看起來很「模板」

---

## 12. Design Decision Rules

根據 app 類型，優先使用以下方向：

| App 類型 | 建議 Design 方向 |
|---|---|
| 查詢 / 目錄 | 卡片列表 + 搜索框 + filter chips + expand/collapse |
| 比較 / 評分 | 表格或橫向 scroll，highlight 最優選項 |
| 工具 / 計算機 | 輸入為主，結果即時更新，減少層次 |
| 指南 / 教學 | 長篇內容，分 section，加明確步驟 |
| 本地 tracker | 列表 + 狀態標記 + 本地 CRUD |
| 詞庫 / 筆記 / vocab 工具 | 列表 + 搜索 + filter + edit modal + quick add |

設計時考慮：

- Tab bar 只在有 3 個或以上獨立頁面時才用
- 單頁內容可以直接用 section 分隔，唔需要硬加 tab
- 搜索框只在條目超過 8 至 10 個時先值得加
- 主操作應該一眼睇到
- 螢幕細時，優先保留層次而唔好塞太多資訊

---

## 13. CSS System Defaults

顏色原則：

- 全 app 只用一個主要 accent color
- `green / amber / red` 只用作語義色
- dark mode 可以調背景同文字，但唔好破壞語義色邏輯

常用變數：

```css
:root {
  --bg: #F7F7F5;
  --white: #FFFFFF;
  --text: #111110;
  --text-muted: #888884;
  --text-light: #BBBBB8;
  --border: #E5E5E2;
  --border-strong: #D0D0CC;
  --accent: #1A3C5E;
  --accent-light: #E8EFF5;
  --green: #1A6B45;
  --green-light: #E8F5EE;
  --amber: #8B5E00;
  --amber-light: #FEF7E8;
  --red: #C0392B;
  --red-light: #FDF0EE;
  --shadow: 0 2px 12px rgba(0,0,0,0.07);
}
```

英文字型分工：

```css
font-family: 'DM Serif Display', serif;
font-family: 'DM Mono', monospace;
font-family: 'Figtree', sans-serif;
```

中文 app 可直接用系統字體：

```css
font-family: -apple-system, 'SF Pro Text', 'Helvetica Neue',
             'PingFang TC', 'Microsoft JhengHei', Arial, sans-serif;
```

字階原則：

- 頁面大標題：32 至 48px
- 區塊標題：20 至 24px
- 卡片標題：17 至 21px
- 正文：14 至 17px
- 輔助文字：11 至 13px
- 微型資訊：10 至 12px

---

## 14. Common UI Patterns

常用元件：

- sticky header
- search bar
- filter chips
- card list
- compare table
- bottom tab bar
- modal
- toast

如果 app 已經有呢啲元件，優先沿用原 pattern，而唔好發明另一套 interaction。

---

## 15. PWA Defaults

如果 app 適合放上手機主畫面，預設加：

- `manifest.json`
- `sw.js`

PWA 原則：

- app 名稱清楚
- 預設唔指定 custom icon，交由系統按網站捷徑方式處理
- 可離線讀基本頁面
- 更新策略簡單直接

---

## 16. Icon Defaults

預設唔另外提供 custom PWA icon。

如果我明確要求，先再為個別 app 製作 icon。

如果要做 icon，預設用以下方向：

- 白色背景
- 用 app 名稱最關鍵嘅一個字
- 字體用 iPhone 默認字體
- 風格保持簡潔，唔做多餘裝飾

---

## 17. How AI Should Respond

當我要求修改 app 或建立新 app 時，AI 應：

- 優先直接實作，而唔係先講長篇方案
- 如有明顯 tradeoff，先簡短講原因
- 完成後用簡潔方式總結改咗咩
- 如果偏離呢份 recipe，要明確講偏離原因
- 如果現有 app 已經有明顯風格，優先跟返個風格

我唔需要 generic best practices；我需要貼近我工作方式、審美同部署習慣嘅結果。

---

## 18. Simple Heuristic

可以用以下順序判斷：

1. 先問：呢個 app 可唔可以繼續保持單頁、原生、零 build step？
2. 如果可以，就唔好升級架構
3. 如果資料只係本地小量保存，先用 `localStorage`
4. 如果內容主要係展示，直接用靜態常數
5. 如果係改舊 app，先跟舊 pattern
6. 只有原方案明顯唔夠用，先提出更重方案

呢份 recipe 係偏好聲明。
除非我明確要求，否則 AI 應將它視為預設做法，而唔係其中一個可選方案。
