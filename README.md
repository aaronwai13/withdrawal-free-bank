# 境外撳錢免費指南

一個純前端、零 build step 嘅靜態小 app，用嚟快速查香港銀行、內地銀行同數字平台喺境外 ATM 撳錢時嘅免費次數、外幣費用同使用貼士。

## Repo 內容

- `index.html`: app 主頁，同時包含 UI、樣式同資料
- `manifest.json`: PWA 基本設定
- `sw.js`: service worker，提供基本離線快取
- `GUIDELINE_LOCAL.md`: 呢個 repo 跟從嘅本地 app recipe

## 特點

- 原生 HTML + CSS + JavaScript
- 無需 `npm install`
- 無 build pipeline
- 可直接放上靜態 hosting
- 手機優先，桌面亦可用
- 支援搜尋、篩選、比較同使用貼士

## 本地開啟

直接開 `index.html` 已可查看內容。

如果想連同 PWA / service worker 一齊測試，建議用任何簡單靜態 server 去開，例如：

```sh
python3 -m http.server 8080
```

之後打開 `http://localhost:8080`。

## 部署

呢個 app 係純靜態網站，可以直接部署到：

- GitHub Pages
- Netlify
- Vercel 靜態站
- 任何可以 serve HTML 檔案嘅空間

## 資料更新

銀行資料目前直接寫喺 `index.html` 內嘅 `BANKS` 常數。

如果要更新內容，通常只需要：

1. 改 `BANKS` 內對應銀行資料
2. 檢查 `使用貼士` 內容有冇需要同步更新
3. 重新部署靜態檔案

## 設計方向

呢個 repo 刻意保持細、直觀、易改：

- 單頁結構
- 原生技術棧
- 小改優先，避免過度工程化
- 視覺上保持 calm, polished, utility-first
