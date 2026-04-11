# 單頁 PWA App 通用開發指南（純本地版）

適用場景：靜態資料展示類 app（查詢、比較、指南、目錄、計算機），**唔需要後端、唔需要登入**，純前端部署。

---

## 1. 檔案結構（最精簡）

```
project/
├── index.html      ← 全部邏輯（HTML + CSS + JS）
├── manifest.json   ← PWA 設定
├── sw.js           ← Service Worker
└── icon-192.png    ← 主畫面 icon（192×192）
```

唔需要 `package.json`、唔需要 build step，直接開 `index.html` 就係 app。

---

## 2. 命名規範

### 檔案
- 全部小寫 kebab-case：`index.html`、`sw.js`、`icon-192.png`

### CSS
- 組件類：語意命名（`.card`、`.filter-chip`、`.stay-item`）
- 狀態類：`.active`、`.show`、`.open`
- 盡量避免 `style="..."` 內聯樣式，動態生成 HTML 字串例外

### JavaScript
- 供 HTML `onclick` 呼叫的函數：掛在 `window` 上（`window.fnName = function(){}`）
- 內部函數：camelCase，唔需要掛 `window`
- 靜態數據：全大寫常數（`const DATA = [...]`、`const CONFIG = {...}`）

---

## 3. Icon 生成規則

- **背景色**：固定深藍 `#1A3C5E`（唔跟 app 主題色，永遠用呢個）
- **文字**：預設用 app 名稱第一個字，除非另有指示
- **文字色**：固定白色
- **字體**：固定 PingFang SC（蘋方），路徑 `/System/Library/Fonts/PingFang.ttc`
- **圓角**：約 20–22% border-radius（192px icon → 約 40px）

用以下 Python 腳本生成（需安裝 Pillow）：

```python
from PIL import Image, ImageDraw, ImageFont

SIZE = 192
RADIUS = 40
BG = "#1A3C5E"   # 固定深藍，唔需要改
TEXT = "撳"       # 換成 app 名稱第一個字
FONT_SIZE = 96
FONT_PATH = "/System/Library/Fonts/PingFang.ttc"  # 固定 PingFang，唔需要改

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

def rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rectangle([x0+radius, y0, x1-radius, y1], fill=fill)
    draw.rectangle([x0, y0+radius, x1, y1-radius], fill=fill)
    for cx, cy in [(x0+radius, y0+radius), (x1-radius, y0+radius),
                   (x0+radius, y1-radius), (x1-radius, y1-radius)]:
        draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius], fill=fill)

rounded_rect(draw, [0, 0, SIZE, SIZE], RADIUS, BG)

font = ImageFont.truetype(FONT_PATH, FONT_SIZE)
bbox = draw.textbbox((0, 0), TEXT, font=font)
w, h = bbox[2]-bbox[0], bbox[3]-bbox[1]
draw.text(((SIZE-w)/2 - bbox[0], (SIZE-h)/2 - bbox[1]), TEXT, font=font, fill="white")

img.save("icon-192.png")
print("Done: icon-192.png")
```

---

## 4. Design 決策原則

唔需要照跟某個固定 design，根據 app 類型揀最合適嘅方向：

| App 類型 | 建議 Design 方向 |
|---|---|
| 查詢 / 目錄 | 卡片列表 + 搜索框 + filter chips + expand/collapse |
| 比較 / 評分 | 表格或橫向 scroll，highlight 最優選項 |
| 工具 / 計算機 | 輸入為主，結果即時更新，減少層次 |
| 指南 / 教學 | 長篇內容，分 section，加 numbered steps |
| 記錄 / Tracker | 列表 + 狀態標記，支援新增／刪除 |

設計時考慮：
- Tab bar 只在有 **3 個或以上獨立頁面** 時才需要
- 單頁內容可以直接用 section 分隔，唔需要 tab
- 搜索框只在條目 **超過 8–10 個** 時才有意義
- 顏色主題根據 app 調性決定，唔一定用深藍

---

## 5. index.html 骨架

```html
<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <!-- VERSION: 2026.01.01.0 -->
  <title>App 名稱</title>

  <!-- PWA（iOS 必須） -->
  <link rel="manifest" href="./manifest.json">
  <link rel="apple-touch-icon" href="./icon-192.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="短名稱">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">

  <!-- 主題色（light/dark 各一） -->
  <meta name="theme-color" content="#F7F7F5" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#111112" media="(prefers-color-scheme: dark)">

  <!-- Google Fonts（按需選用） -->
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=Figtree:wght@300;400;500;600&display=swap" rel="stylesheet">

  <style>/* 全部 CSS */</style>
</head>
<body>
  <div id="app">
    <!-- Header（sticky） -->
    <!-- 頁面內容 -->
  </div>
  <!-- Tab Bar（fixed bottom，如有需要） -->
  <script>/* 全部 JS */</script>
</body>
</html>
```

---

## 6. CSS 系統

### 顏色變數（light/dark 自動切換）

```css
:root {
  --bg: #F7F7F5;
  --white: #FFFFFF;        /* 卡片、header、tab bar 表面色 */
  --text: #111110;
  --text-muted: #888884;
  --text-light: #BBBBB8;
  --border: #E5E5E2;
  --border-strong: #D0D0CC;
  --accent: #1A3C5E;        /* 換成你的主題色 */
  --accent-light: #E8EFF5;
  --green: #1A6B45;
  --green-light: #E8F5EE;
  --amber: #8B5E00;
  --amber-light: #FEF7E8;
  --red: #C0392B;
  --red-light: #FDF0EE;
  --shadow: 0 2px 12px rgba(0,0,0,0.07);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111112;
    --white: #1C1C1E;
    --text: #F2F2F0;
    --text-muted: #888884;
    --text-light: #48484A;
    --border: #2A2A2C;
    --border-strong: #3A3A3C;
    --accent: #5B9BD5;      /* dark mode 要比 light mode 調淺 */
    --accent-light: #1A2A3A;
    --green: #4ADE80;
    --green-light: #0A2016;
    --amber: #FCD34D;
    --amber-light: #251A00;
    --red: #F87171;
    --red-light: #2A1010;
    --shadow: 0 2px 16px rgba(0,0,0,0.4);
  }
}
```

**原則：**
- `--bg` 係頁面底色，`--white` 係卡片／header／tab bar 表面色
- `--accent` 係唯一強調色，按鈕、連結、focus ring 全部用它
- `--green` / `--amber` / `--red` 固定代表好 / 警告 / 壞，唔可以挪作裝飾用途
- dark mode 只需覆蓋背景同文字系列變數，語義色保持不變

### 字型分工

英文設計感 app，用 Google Fonts：
```css
font-family: 'DM Serif Display', serif;   /* 大標題（優雅感） */
font-family: 'DM Mono', monospace;        /* 數字、badge、label（精準感） */
font-family: 'Figtree', sans-serif;       /* 正文、按鈕（body default） */
```

中文 app，用系統字體棧（無需引入外部字型）：
```css
font-family: -apple-system, 'SF Pro Text', 'Helvetica Neue',
             'PingFang TC', 'Microsoft JhengHei', Arial, sans-serif;
```

### 字階

| 用途 | 大小 | 字重 |
|------|------|------|
| 頁面大標題 | 32–48px | 600 |
| 區塊標題 | 20–24px | 600 |
| 卡片標題 | 17–21px | 500–600 |
| 正文 | 14–17px | 400 |
| 輔助文字、標籤 | 11–13px | 400 |
| 微型（時間戳、小 tag）| 10–12px | 400 |

### 佈局基礎

```css
* {
  margin: 0; padding: 0; box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
body {
  background: var(--bg); color: var(--text);
  font-family: 'Figtree', sans-serif;
  min-height: 100vh;
  /* 留 tab bar 空間，無 tab bar 可改為 0 */
  padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px));
}
#app { max-width: 480px; margin: 0 auto; }
```

---

## 7. 常用 UI 元件

### Sticky Header

```css
.header {
  background: var(--white);
  padding: 20px 16px 0;
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 20;
}
```

### Tab Bar（底部固定，3 個頁面或以上才用）

```css
.tab-bar {
  position: fixed; bottom: 0;
  left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px;
  height: 60px; background: var(--white);
  border-top: 1px solid var(--border);
  display: flex; z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.tab-bar::after {
  content: ''; position: absolute;
  bottom: calc(-1 * env(safe-area-inset-bottom, 0px));
  left: 0; right: 0;
  height: env(safe-area-inset-bottom, 0px);
  background: var(--white);
}
```

Tab 切換（JS）：

```javascript
const TABS = ['A', 'B', 'C']; // 換成你的 tab 名

window.switchTab = function(t) {
  TABS.forEach(x => {
    document.getElementById('page' + x).classList.toggle('active', x === t);
    document.getElementById('tab' + x).classList.toggle('active', x === t);
  });
};
```

```css
.page { display: none; }
.page.active { display: block; }
```

### 搜索框

```css
.search-wrap { padding: 0 0 12px; position: relative; }
.search-input {
  width: 100%; padding: 10px 14px 10px 36px;
  border: 1.5px solid var(--border-strong); border-radius: 10px;
  font-size: 14px; background: var(--bg); color: var(--text);
  outline: none; transition: border-color 0.2s;
}
.search-input:focus { border-color: var(--accent); }
.search-icon {
  position: absolute; left: 12px; top: 0; bottom: 12px;
  margin: auto 0; color: var(--text-light); pointer-events: none;
}
```

只在條目超過 8–10 個時才加。放喺 sticky header 入面，用 `oninput="filterItems()"` 觸發即時過濾。

### Expand / Collapse 卡片（純 CSS 動畫）

```css
.card-body {
  max-height: 0; overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1);
}
.card.open .card-body { max-height: 800px; }
.expand-btn { transition: transform 0.3s; }
.card.open .expand-btn { transform: rotate(180deg); }
```

```javascript
window.toggleCard = function(el) {
  el.closest('.card').classList.toggle('open');
};
```

### Badge（狀態標籤）

```css
.badge {
  font-size: 10px; font-weight: 600;
  padding: 3px 8px; border-radius: 6px;
  font-family: 'DM Mono', monospace;
}
.badge-green { background: var(--green-light); color: var(--green); }
.badge-amber { background: var(--amber-light); color: var(--amber); }
.badge-red   { background: var(--red-light);   color: var(--red); }
.badge-blue  { background: var(--accent-light); color: var(--accent); }
```

### Filter Chips

```css
.filter-row {
  display: flex; gap: 6px; padding-bottom: 10px;
  overflow-x: auto; -webkit-overflow-scrolling: touch;
}
.chip {
  flex-shrink: 0; padding: 6px 12px; border-radius: 99px;
  font-size: 12px; font-weight: 600;
  border: 1.5px solid var(--border-strong);
  background: transparent; color: var(--text-muted);
  cursor: pointer; transition: all 0.15s;
}
.chip.active { background: var(--accent); color: white; border-color: var(--accent); }
```

### Toast 通知

```css
.toast {
  position: fixed; bottom: calc(60px + env(safe-area-inset-bottom, 0px) + 16px);
  left: 50%; transform: translateX(-50%);
  background: var(--white); border: 1px solid var(--border);
  border-radius: 10px; padding: 10px 18px;
  font-size: 12px; font-weight: 600;
  z-index: 450; white-space: nowrap;
  box-shadow: var(--shadow); opacity: 0;
  transition: opacity 0.3s ease; pointer-events: none;
}
.toast.show { opacity: 1; }
```

```javascript
let toastTimer = null;
function showToast(msg, color = 'var(--green)') {
  const t = document.getElementById('toast');
  if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
  t.textContent = msg; t.style.color = color;
  t.classList.remove('show');
  void t.offsetWidth; // 強制 reflow，重置動畫
  t.classList.add('show');
  toastTimer = setTimeout(() => { t.classList.remove('show'); toastTimer = null; }, 2500);
}
```

HTML：`<div class="toast" id="toast"></div>`

---

## 8. 靜態數據結構

靜態數據放喺 JS `const` 入面，唔需要獨立 JSON 檔案：

```javascript
const DATA = [
  {
    id: 'unique-key',
    name: '名稱',
    subtitle: '副標題',
    tags: ['tag1', 'tag2'],        // 用作 filter
    badges: [{ t: '標籤', c: 'badge-green' }],
    sections: [
      {
        label: '分類名',
        items: [
          { i: '✓', c: 'good', t: '內容文字' },
          { i: '⚠', c: 'warn', t: '內容文字' },
          { i: '—', c: '',     t: '內容文字' },
        ]
      }
    ]
  }
];
```

---

## 9. PWA 必要檔案

### manifest.json

```json
{
  "name": "完整 App 名稱",
  "short_name": "主畫面名稱",
  "description": "描述",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#F7F7F5",
  "theme_color": "#1A3C5E",
  "lang": "zh-HK",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### sw.js（直接複製，只改 CACHE 名稱）

```javascript
const CACHE = 'app-name-v2026.01.01.0'; // 版本號同 index.html 頂部保持一致

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.json']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      })
    )
  );
});
```

---

## 10. 版本管理

版本格式：`YYYY.MM.DD.序號`（同日多次更新時序號遞增，例：`2026.04.10.0`、`2026.04.10.1`）

每次更新**必須同步兩處**：

1. `index.html` 頂部 comment：
   ```html
   <!-- VERSION: 2026.04.10.0 -->
   ```

2. `sw.js` 的 cache 名稱：
   ```javascript
   const CACHE = 'app-name-v2026.04.10.0';
   ```

更新 cache 名稱會觸發 Service Worker 重新安裝，用戶下次打開 app 時靜默取得新版本。

---

## 11. 部署（GitHub Pages）

1. Repo 設定 → Pages → Source 選 `main` branch，根目錄 `/`
2. 直接 push 到 `main` → 自動 deploy（約 1–2 分鐘）
3. 更新內容後記得同步 `sw.js` 版本號，確保用戶清除舊緩存

---

## 12. 快速開始 Checklist

- [ ] 根據 app 類型決定 design 方向（參考上方表格）
- [ ] 複製 HTML 骨架，按需保留或移除 tab bar
- [ ] 決定主題色，更新 `--accent` 及 dark mode 對應色
- [ ] 用 Python 腳本生成 `icon-192.png`（背景固定 `#1A3C5E`，白色文字，app 名第一個字）
- [ ] 定義靜態數據（`const DATA = [...]`）並寫 render 函數
- [ ] 更新 `manifest.json` 名稱、描述、顏色
- [ ] 在 `index.html` 頂部加 `<!-- VERSION: YYYY.MM.DD.0 -->`
- [ ] 改 `sw.js` 的 `CACHE` 版本號，與 VERSION comment 一致
- [ ] 設定 GitHub Pages（Settings → Pages → main branch）
- [ ] Push 到 GitHub main branch，測試 PWA 安裝
