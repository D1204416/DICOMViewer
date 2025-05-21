# DICOM Viewer

DICOM Viewer 是一個基於 React 的網頁應用程式，用於顯示和標記醫療影像 DICOM 檔案。此應用程式允許使用者上傳 DICOM 檔案，查看患者資訊，調整窗寬/窗位，以及在影像上繪製和編輯多邊形標記。

## 功能特點

- 上傳 DICOM 文件並解析
- 顯示患者信息（姓名、出生日期、年齡、性別）
- 在 Canvas 上渲染 DICOM 影像
- 窗寬/窗位調整，包含腦部、肺部、軟組織和骨頭的預設值
- 支援影像縮放、平移和黑白反轉功能
- 提供標記工具，可在影像上繪製多邊形標記
- 管理標記列表，支持編輯和刪除操作
- 提供鍵盤快捷鍵進行影像操作

## 技術堆疊

- React 18
- Vite 4
- dicom-parser 庫用於解析 DICOM 文件
- HTML5 Canvas 用於繪製影像和標記
- 自定義 CSS 樣式

## 專案結構

```
dicom-viewer/
├── node_modules/      # 相依套件
├── public/            # 靜態資源
├── src/               # 原始碼
│   ├── assets/        # 靜態資源
│   ├── components/    # React 組件
│   │   ├── DicomCanvas.jsx        # DICOM 影像顯示和互動畫布
│   │   ├── DicomUploader.jsx      # DICOM 檔案上傳組件
│   │   ├── DrawingControls.jsx    # 繪製控制介面
│   │   ├── Header.jsx             # 頁面標題組件
│   │   ├── LabelList.jsx          # 標記列表組件
│   │   ├── LabelTools.jsx         # 標記工具組件
│   │   ├── PatientInfo.jsx        # 患者資訊顯示組件
│   │   └── WindowControls.jsx     # 窗寬/窗位控制組件
│   ├── styles/        # 樣式文件
│   │   └── index.css  # 全局樣式
│   ├── utils/         # 工具函數
│   │   ├── dateUtils.js           # 日期處理工具
│   │   └── dicomHelper.js         # DICOM 解析和處理工具
│   ├── App.jsx        # 應用主組件
│   ├── DicomViewer.jsx # DICOM 視圖主組件
│   └── main.jsx       # 應用入口點
├── index.html         # HTML 入口
├── package.json       # 專案配置和依賴
└── vite.config.js     # Vite 配置
```

## 安裝與運行

```bash
# 進入專案目錄
cd dicom-viewer

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

啟動後，應用將在 http://localhost:5173 運行。

## 使用方法

1. 點擊 "Upload" 按鈕上傳 DICOM 文件
2. 文件上傳後，頁面將顯示患者信息和影像
3. 點擊 "Add" 按鈕開始在影像上繪製標記
4. 點擊影像添加多邊形的頂點，至少需要 3 個點
5. 點擊 "完成繪製" 按鈕完成標記
6. 在標記列表中可以編輯或刪除已添加的標記

### 影像操作

- **平移**：按住滑鼠左鍵拖動影像
- **縮放**：使用滑鼠滾輪或點擊界面上的「+」和「-」按鈕
- **窗寬/窗位調整**：點擊左上角的「窗位/窗寬」按鈕，調整滑動條或選擇預設值

### 鍵盤快捷鍵

- **0**: 重置視圖
- **1**: 適合視窗
- **2**: 居中
- **+/-**: 放大/縮小
- **i**: 黑白反轉

## 核心功能實現

### DICOM 文件解析
使用 dicom-parser 庫解析 DICOM 文件，提取像素數據和患者信息：

```javascript
// 解析 DICOM 檔案
const dicomData = parseDicomFile(arrayBuffer);

// 創建可顯示的影像
const imageObj = await createDicomImage(dicomData);
```

### 影像渲染
在 Canvas 上渲染 DICOM 影像，支持縮放和平移：

```javascript
// 繪製影像，考慮偏移和縮放
ctx.drawImage(
  dicomImage, 
  offset.x, offset.y, 
  canvasSize.width * imageToCanvasRatioX / scale, 
  canvasSize.height * imageToCanvasRatioY / scale,
  0, 0, 
  canvasSize.width / scale, 
  canvasSize.height / scale
);
```

### 標記系統
實現多邊形標記功能，支持添加、編輯和刪除操作：

```javascript
// 添加新標記
const addLabel = () => {
  if (dicomFile) {
    setIsDrawing(true);
    setCurrentPolygon([]);
    setEditingLabelIndex(-1);
  }
};

// 處理畫布點擊
const handleCanvasClick = (point) => {
  if (isDrawing) {
    // 繪製新多邊形
    setCurrentPolygon([...currentPolygon, point]);
  }
};
```

## 擴展規劃

- 支持多幀 DICOM 文件（CT/MRI 序列）
- 添加多種標記工具（矩形、橢圓、測量工具）
- 標記區域的計算功能（面積、周長等）
- 支持 DICOM 目錄上傳和瀏覽
- 影像註釋和報告生成功能