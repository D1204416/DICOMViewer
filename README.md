# DICOM 醫療影像查看器

這是一個使用 React 開發的 DICOM 醫療影像查看器，可以上傳、顯示 DICOM 格式的醫療影像，並提供標記工具功能。

## 功能特點

- 上傳 DICOM 文件並解析
- 顯示患者信息（姓名、出生日期、年齡、性別）
- 在 Canvas 上渲染 DICOM 影像
- 提供標記工具，可在影像上繪製多邊形標記
- 管理標記列表，支持編輯和刪除操作

## 技術堆疊

- React 18
- Vite 4
- dicom-parser 庫用於解析 DICOM 文件
- HTML5 Canvas 用於繪製影像和標記
- 自定義 CSS 樣式

## 安裝與運行

```bash
# 克隆專案
git clone https://github.com/yourusername/dicom-viewer.git

# 進入專案目錄
cd dicom-viewer

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

啟動後，應用將在 http://localhost:5173 運行。

## 專案結構

```
dicom-viewer/
├── src/
│   ├── components/        # 各個組件
│   │   ├── DicomCanvas.jsx
│   │   ├── DicomUploader.jsx
│   │   ├── DrawingControls.jsx
│   │   ├── Header.jsx
│   │   ├── LabelList.jsx
│   │   ├── LabelTools.jsx
│   │   └── PatientInfo.jsx
│   ├── styles/            # 樣式文件
│   │   └── index.css
│   ├── utils/             # 通用工具函數
│   │   └── dicomHelper.js
│   ├── App.jsx            # 應用入口
│   ├── DicomViewer.jsx    # 主應用組件
│   └── main.jsx           # React 入口點
└── public/                # 靜態資源
```

## 使用方法

1. 點擊 "Upload" 按鈕上傳 DICOM 文件
2. 文件上傳後，頁面將顯示患者信息和影像
3. 點擊 "Add" 按鈕開始在影像上繪製標記
4. 點擊影像添加多邊形的頂點，至少需要 3 個點
5. 點擊 "完成繪製" 按鈕完成標記
6. 在標記列表中可以編輯或刪除已添加的標記

## 注意事項

本應用僅用於教育和演示目的，並非醫療診斷工具。不應在臨床環境中使用。

## 許可證

MIT