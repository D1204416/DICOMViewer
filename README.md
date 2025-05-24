# 🩻 DICOM Viewer (React + Canvas)

DICOM Viewer 是一個基於 **React** 與 **HTML5 Canvas** 打造的醫療影像標註工具，支援 DICOM 影像上傳、檢視與標記，包含窗寬/窗位調整、縮放、平移、黑白反轉等功能，並可進行多邊形標記與編輯。

---

## 🚀 功能特點

  * 上傳並解析 DICOM 檔案
  * 顯示病患資訊：姓名、ID、出生年月、年齡、性別、檢查部位、姿勢
  * Canvas 顯示影像，支援：

  * 縮放與平移
  * 黑白反轉
  * 窗寬 / 窗位調整（含預設值）
  * 多邊形標記工具

  * 支援繪製、編輯、刪除
  * 編輯模式可移動頂點
  * ⌨️ 鍵盤快捷鍵輔助操作

---

## 🧰 技術堆疊

* React 18 + Vite 4
* dicom-parser：解析 DICOM 二進位內容
* HTML5 Canvas：影像與標記繪圖
* 自訂 hook 與模組化 CSS（支援擴充 cornerstonejs）

---

## 📁 專案結構與說明

```
src/
├── App.jsx                   # 主應用組件，掛載 DicomViewer
├── DicomViewer.jsx           # 核心組件：控制影像載入、標記邏輯與畫布互動
├── main.jsx                  # React 應用入口，綁定 root 節點
├── index.css                 # 全域樣式入口，整合所有 CSS 模組

hooks/
├── useDicomEditor.js         # 自定義 hook：封裝標記新增、編輯、取消等狀態管理
└── useCanvasInteraction.js   # 自定義 hook：管理 Canvas 的滑鼠互動、縮放、平移邏輯

components/
├── CanvasToolbar.jsx         # 畫布左下角工具列（縮放、重設、反轉）
├── DicomCanvas.jsx           # 顯示 DICOM 影像並處理滑鼠互動與標記繪製
├── DicomUploader.jsx         # 處理檔案上傳並解析為 dicomData 與影像
├── DrawingControls.jsx       # 標記與編輯狀態下的「完成 / 取消」按鈕
├── WindowControls.jsx        # 控制窗寬/窗位的元件，含預設按鈕與滑桿
├── PatientInfo.jsx           # 顯示病患資訊欄位（姓名、ID、生日等）
├── LabelTools.jsx            # 右側工具列中的「新增標記」按鈕
├── LabelList.jsx             # 顯示目前所有標記清單，可編輯 / 刪除
└── Header.jsx                # 頁首標題列

utils/
├── dicomHelper.js            # 公用繪圖函式：drawPolygon, drawDefaultImage, getPresetWindows
├── dicomImageRenderer.js     # createDicomImage：根據窗寬/窗位將像素轉為影像
├── dicomMetadataParser.js    # parseDicomFile：解析 ArrayBuffer 為 dicomData 與 patientInfo
└── dateUtils.js              # 處理 DICOM 日期、年齡計算、格式化工具

styles/
├── base.css                  # 全域 reset 與 CSS 變數定義（顏色、排版）
├── layout.css                # 頁面主要排版：左右欄、flex 排版
├── canvas.css                # Canvas 畫布樣式、工具提示、縮放資訊
├── patient.css               # 病患資訊面板樣式
├── tools.css                 # 標記工具與標記清單樣式
├── drawing-controls.css      # 「完成標記 / 取消」控制區樣式
└── upload.css                # 上傳按鈕與 loading 動畫樣式

public/
└── index.html                # 主 HTML 模板

package.json                 # 專案依賴與 npm script
vite.config.js              # Vite 開發伺服器與打包設定
```

---

## 📦 安裝與啟動

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

打開瀏覽器前往：[http://localhost:5173](http://localhost:5173)

---

## 🖱️ 使用方式

### 標記與操作流程

1. 點擊 **Upload** 上傳 DICOM 檔案
2. 自動顯示病患資訊與 Canvas 影像
3. 點擊 **Add** 啟動標記模式
4. 在畫布上點擊新增頂點（至少 3 點）
5. 點擊「完成」儲存標記
6. 使用列表中的按鈕編輯 / 刪除標記

### 影像互動操作

* 拖動影像：滑鼠左鍵按住拖動
* 縮放影像：Canvas 工具列 + / - 按鈕
* 黑白反轉：Canvas 工具列「◐」按鈕
* 調整窗寬 / 窗位：點擊左上「窗位/窗寬」控制器

### 鍵盤快捷鍵

| 鍵盤    | 功能      |
| ----- | ------- |
| 0     | 重置視圖    |
| + / - | 放大 / 縮小 |
| i     | 黑白反轉    |


---
## ✅ 影像的還原與顯示的資訊對照表：

1. 像素資料（Pixel Data）

  - Pixel Data	(7FE0,0010)	
  - Bits Allocated	(0028,0100)	
  - Bits Stored	(0028,0101)	
  - High Bit	(0028,0102)	
  - Pixel Representation	(0028,0103)	
  - Samples per Pixel	(0028,0002)	
  - Planar Configuration	(0028,0006)	
  - Photometric Interpretation	(0028,0004)	

2. 幾何資訊（Image Geometry）

  - Rows	(0028,0010)	
  - Columns	(0028,0011)	

3. 顯示資訊（Windowing / LUT）

  - Window Center	(0028,1050)	
  - Window Width	(0028,1051)	
  - Rescale Intercept	(0028,1052)	
  - Rescale Slope	(0028,1053)	
  - Rescale Type	(0028,1054)	


---

## ✅ TODO / 擴充建議

* [ ] 儲存標記結果為 JSON
* [ ] 整合 cornerstonejs v4 提供進階影像處理
* [ ] 加入 AI 模型推論標記區域（如腫瘤辨識）
* [ ] 導入 Web PACS 查詢與匿名化功能