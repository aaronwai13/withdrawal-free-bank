# 開發偏好

## 技術要求
- 單一 HTML 文件（HTML + CSS + JS 寫埋一齊）
- 部署在 GitHub Pages
- 支援 PWA（Add to Home Screen），包含 Service Worker
- 手機優先設計，針對 iPhone 優化
- 繁體中文（香港口語）介面
- 支援 prefers-color-scheme 自動切換 dark mode

## 設計風格
- 簡潔白底銀行風或深色金色風格，視乎 app 類型
- Google Fonts：DM Serif Display、DM Mono、Figtree
- 圓角卡片、柔和陰影
- 進度條 / 統計卡等視覺元素
- Dark mode 用深灰底配柔和文字，避免純黑純白

## 功能慣例
- Firebase Realtime Database 做數據儲存
- Google 登入（未登入可讀，登入先可寫）
- 支援新增、編輯、刪除記錄
- 自動計算進度 / 剩餘額度
- FAB 按鈕新增記錄，表單開啟時隱藏 FAB
- 用廣東話回覆
