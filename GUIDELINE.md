# 單頁 PWA App 通用開發指南

適用場景：靜態資料展示類 app（查詢、比較、指南、目錄），唔需要後端，純前端。

---

## 檔案結構（最精簡）

```
project/
├── index.html      ← 全部邏輯（HTML + CSS + JS）
├── manifest.json   ← PWA 設定
├── sw.js           ← Service Worker
└── icon-192.png    ← 主畫面 icon（192×192）
```

---

## index.html 骨架

```html
<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
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

  <!-- Google Fonts -->
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

## CSS 系統

### 顏色變數（light/dark 自動切換）

```css
:root {
  --bg: #F7F7F5;
  --white: #FFFFFF;
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
    --accent: #5B9BD5;      /* dark mode 要調淺 */
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

### 字型分工

```css
font-family: 'DM Serif Display', serif;   /* 大標題 */
font-family: 'DM Mono', monospace;        /* 數字、badge、label */
font-family: 'Figtree', sans-serif;       /* 正文、按鈕（body default） */
```

### 佈局基礎

```css
* { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body {
  background: var(--bg); color: var(--text);
  font-family: 'Figtree', sans-serif;
  min-height: 100vh;
  padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px)); /* 留 tab bar 空間 */
}
#app { max-width: 480px; margin: 0 auto; } /* 手機寬度限制 */
```

---

## 常用 UI 元件

### Sticky Header

```css
.header {
  background: var(--white); padding: 20px 16px 0;
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 20;
}
```

### Tab Bar（底部固定）

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
/* 填滿 safe area 背景（iPhone 底部白條） */
.tab-bar::after {
  content: ''; position: absolute;
  bottom: calc(-1 * env(safe-area-inset-bottom, 0px));
  left: 0; right: 0;
  height: env(safe-area-inset-bottom, 0px);
  background: var(--white);
}
```

### Tab 切換（JS）

```javascript
const TABS = ['A', 'B', 'C']; // 換成你的 tab 名

function switchTab(t) {
  TABS.forEach(x => {
    document.getElementById('page' + x).classList.toggle('active', x === t);
    document.getElementById('tab' + x).classList.toggle('active', x === t);
  });
}
```

```css
.page { display: none; }
.page.active { display: block; }
```

### Expand / Collapse 卡片（純 CSS 動畫）

```css
.card-body {
  max-height: 0; overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1);
}
.card.open .card-body { max-height: 800px; } /* 估計最大高度 */
```

```javascript
function toggleCard(el) {
  el.closest('.card').classList.toggle('open');
}
```

### Badge（狀態標籤）

```css
.badge { font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 6px; font-family: 'DM Mono', monospace; }
.badge-green { background: var(--green-light); color: var(--green); }
.badge-amber { background: var(--amber-light); color: var(--amber); }
.badge-red   { background: var(--red-light);   color: var(--red); }
.badge-blue  { background: var(--accent-light); color: var(--accent); }
```

### Filter Chips

```css
.filter-row { display: flex; gap: 6px; padding-bottom: 10px; }
.chip {
  flex: 1; text-align: center; padding: 6px 4px; border-radius: 99px;
  font-size: 12px; font-weight: 600;
  border: 1.5px solid var(--border-strong);
  background: transparent; color: var(--text-muted);
  cursor: pointer; transition: all 0.15s;
}
.chip.active { background: var(--accent); color: white; border-color: var(--accent); }
```

---

## 數據結構建議

靜態數據放喺 JS `const` 入面，唔需要 JSON 檔案：

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

## PWA 必要檔案

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
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### sw.js（直接複製，改 CACHE 名稱即可）

```javascript
const CACHE = 'app-name-v1'; // 更新版本時改呢個字串

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.json'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    // 主頁面：網絡優先（確保拿到最新版）
    e.respondWith(fetch(e.request).then(res => {
      caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }
  // 其他資源：緩存優先
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
    caches.open(CACHE).then(c => c.put(e.request, res.clone()));
    return res;
  })));
});
```

---

## 部署（GitHub Pages）

1. Repo 設定 → Pages → Source 選 `main` branch
2. 直接 push 到 `main` → 自動 deploy
3. 更新內容後，將 `sw.js` 裡的 `CACHE` 版本號 +1，確保用戶清除舊緩存

---

## 快速開始 Checklist

- [ ] 複製以上 HTML 骨架
- [ ] 改 `--accent` 顏色
- [ ] 定義數據結構（`const DATA = [...]`）
- [ ] 寫 render 函數
- [ ] 改 `manifest.json` 名稱／顏色
- [ ] 改 `sw.js` 的 `CACHE` 名稱
- [ ] 準備 `icon-192.png`
- [ ] Push 到 GitHub main branch
