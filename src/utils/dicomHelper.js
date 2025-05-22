// src/utils/dicomHelper.js - 優化 DICOM 解析功能

import * as dicomParser from 'dicom-parser';

/**
 * 安全地從 dataSet 中讀取字串值
 * @param {Object} dataSet - dicom-parser 解析的資料集
 * @param {string} tag - DICOM 標籤
 * @param {string} defaultValue - 默認值
 * @returns {string} 讀取的值或默認值
 */
const safeGetString = (dataSet, tag, defaultValue = '') => {
  try {
    const value = dataSet.string(tag);
    return value !== undefined ? value : defaultValue;
  } catch (error) {
    console.log(`讀取標籤 ${tag} 時發生錯誤:`, error);
    return defaultValue;
  }
};

/**
 * 安全地從 dataSet 中讀取數值
 * @param {Object} dataSet - dicom-parser 解析的資料集
 * @param {string} tag - DICOM 標籤
 * @param {number} defaultValue - 默認值
 * @returns {number} 讀取的值或默認值
 */
const safeGetNumber = (dataSet, tag, defaultValue = 0) => {
  try {
    const value = dataSet.floatString(tag);
    return value !== undefined ? value : defaultValue;
  } catch (error) {
    console.log(`讀取標籤 ${tag} 時發生錯誤:`, error);
    return defaultValue;
  }
};

/**
 * 安全地從 dataSet 中讀取整數
 * @param {Object} dataSet - dicom-parser 解析的資料集
 * @param {string} tag - DICOM 標籤
 * @param {number} defaultValue - 默認值
 * @returns {number} 讀取的值或默認值
 */
const safeGetUint16 = (dataSet, tag, defaultValue = 0) => {
  try {
    const value = dataSet.uint16(tag);
    return value !== undefined ? value : defaultValue;
  } catch (error) {
    console.log(`讀取標籤 ${tag} 時發生錯誤:`, error);
    return defaultValue;
  }
};

/**
 * 解析 DICOM 檔案，提取患者信息和圖像數據
 * @param {ArrayBuffer} arrayBuffer - DICOM 檔案的 ArrayBuffer
 * @returns {Object} 包含解析結果的對象
 */
export const parseDicomFile = (arrayBuffer) => {
  try {
    const byteArray = new Uint8Array(arrayBuffer);
    let dataSet;

    try {
      dataSet = dicomParser.parseDicom(byteArray);
    } catch (parseError) {
      console.error('解析 DICOM 結構時發生錯誤:', parseError);
      throw new Error('DICOM 解析失敗：檔案可能已損壞或格式不支援');
    }

    // 解析患者信息 - 使用安全讀取函數
    const patientName = safeGetString(dataSet, 'x00100010', 'Unknown');

    // 提取病患ID (0010,0020)
    const patientId = safeGetString(dataSet, 'x00100020', 'Unknown');
    console.log('原始病患ID:', patientId);

    // 提取出生日期 (0010,0030)
    let birthdate = safeGetString(dataSet, 'x00100030', 'Unknown');
    console.log('原始出生日期:', birthdate);

    // 提取出生時間 (0010,0032)
    const birthTime = safeGetString(dataSet, 'x00100032', 'Unknown');
    console.log('原始出生時間:', birthTime);

    // 提取年齡 (0010,1010)
    let age = safeGetString(dataSet, 'x00101010', 'Unknown');
    console.log('原始年齡:', age);

    // 提取性別 (0010,0040)
    const sex = safeGetString(dataSet, 'x00100040', 'Unknown');

    // 提取檢查部位 (0018,0015)
    const bodyPartExamined = safeGetString(dataSet, 'x00180015', 'Unknown');
    console.log('原始部位:', bodyPartExamined);

    // 提取病人位置 (0018,5100)
    const patientPosition = safeGetString(dataSet, 'x00185100', 'Unknown');
    console.log('原始病人位置:', patientPosition);


    // 如果在 DICOM 中找不到出生日期，但有年齡，嘗試從年齡推算大概的出生年份
    if (birthdate === 'Unknown' && age !== 'Unknown') {
      console.log('嘗試從年齡推算出生年份');
      // 一般 DICOM 的年齡格式為 "070Y" 表示 70 歲
      const match = age.match(/^(\d+)([DWMY])$/);
      if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2];

        const today = new Date();
        let birthYear = today.getFullYear();

        switch (unit) {
          case 'Y': // 年
            birthYear -= value;
            break;
          case 'M': // 月
            birthYear = today.getFullYear() - Math.floor(value / 12);
            break;
          case 'W': // 周
            birthYear = today.getFullYear() - Math.floor(value / 52);
            break;
          case 'D': // 日
            birthYear = today.getFullYear() - Math.floor(value / 365);
            break;
        }

        // 生成一個模擬的出生日期 (只有年份是準確的)
        birthdate = `${birthYear}0101`;
        console.log('從年齡推算的出生日期:', birthdate);
      }
    } else if (birthdate !== 'Unknown') {
      // 計算年齡（如果有出生日期但沒有年齡）
      if (age === 'Unknown') {
        // 格式化出生日期為YYYYMMDD
        if (birthdate.length === 8) {
          try {
            const birthYear = parseInt(birthdate.substring(0, 4), 10);
            const birthMonth = parseInt(birthdate.substring(4, 6), 10) - 1; // JS月份從0開始
            const birthDay = parseInt(birthdate.substring(6, 8), 10);

            const birthDate = new Date(birthYear, birthMonth, birthDay);
            const today = new Date();

            // 計算年齡
            let ageYears = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              ageYears--;
            }

            age = ageYears.toString();
            console.log('從出生日期計算的年齡:', age);
          } catch (error) {
            console.log('計算年齡時發生錯誤:', error);
          }
        }
      }
    }

    const patientData = {
      patientName,
      patientId,
      birthdate,
      birthTime,
      age,
      sex,
      bodyPartExamined,
      patientPosition
    };

    // 處理影像數據
    let pixelDataElement;

    try {
      pixelDataElement = dataSet.elements.x7fe00010;
    } catch (error) {
      console.error('訪問像素數據元素時出錯:', error);
    }

    if (!pixelDataElement) {
      throw new Error('無法找到像素數據');
    }

    // 獲取重要的影像參數 - 使用安全讀取函數
    const rows = safeGetUint16(dataSet, 'x00280010', 512);
    const columns = safeGetUint16(dataSet, 'x00280011', 512);
    const bitsAllocated = safeGetUint16(dataSet, 'x00280100', 8);
    const bitsStored = safeGetUint16(dataSet, 'x00280101', 8);
    const highBit = safeGetUint16(dataSet, 'x00280102', 7);
    const pixelRepresentation = safeGetUint16(dataSet, 'x00280103', 0);
    const samplesPerPixel = safeGetUint16(dataSet, 'x00280002', 1);
    const planarConfiguration = safeGetUint16(dataSet, 'x00280006', 0);

    // 獲取光度解釋參數
    const photometricInterpretation = safeGetString(dataSet, 'x00280004', 'MONOCHROME2');

    // 獲取窗口寬度和中心值
    let windowCenter = safeGetNumber(dataSet, 'x00281050', 127);
    let windowWidth = safeGetNumber(dataSet, 'x00281051', 256);

    // 如果窗口值是陣列，取第一個值
    if (Array.isArray(windowCenter)) windowCenter = windowCenter[0];
    if (Array.isArray(windowWidth)) windowWidth = windowWidth[0];

    // 獲取 Rescale Slope 和 Intercept
    const rescaleSlope = safeGetNumber(dataSet, 'x00281053', 1);
    const rescaleIntercept = safeGetNumber(dataSet, 'x00281052', 0);
    const rescaleType = safeGetString(dataSet, 'x00281054', '');

    // 如果是CT影像（rescaleType為HU）且沒有窗口值，設置適當的默認值
    const isHU = rescaleType === 'HU';
    if (isHU) {
      if (windowWidth <= 0) {
        // 默認使用腹部窗設定
        windowCenter = 40;
        windowWidth = 400;
        console.log('使用默認腹部窗設定:', { center: windowCenter, width: windowWidth });
      }
    } else {
      // 非CT影像的默認窗口值
      if (windowWidth <= 0) {
        windowCenter = 127;
        windowWidth = 256;
      }
    }

    // 檢查 transfer syntax UID
    const transferSyntaxUID = safeGetString(dataSet, 'x00020010', '1.2.840.10008.1.2');

    console.log("DICOM Info:", {
      rows,
      columns,
      bitsAllocated,
      bitsStored,
      highBit,
      pixelRepresentation,
      samplesPerPixel,
      photometricInterpretation,
      windowCenter,
      windowWidth,
      rescaleSlope,
      rescaleIntercept,
      rescaleType,
      transferSyntaxUID,
      patientData
    });

    return {
      dataSet,
      pixelDataElement,
      rows,
      columns,
      bitsAllocated,
      bitsStored,
      highBit,
      pixelRepresentation,
      samplesPerPixel,
      photometricInterpretation,
      windowCenter,
      windowWidth,
      rescaleSlope,
      rescaleIntercept,
      rescaleType,
      transferSyntaxUID,
      patientData
    };
  } catch (error) {
    console.error('解析 DICOM 檔案時發生錯誤:', error);
    throw error;
  }
};

/**
 * 從 DICOM 數據集創建圖像
 * @param {Object} dicomData - 解析後的 DICOM 數據
 * @returns {Promise<HTMLImageElement>} 處理後的圖像
 */
export const createDicomImage = async (dicomData) => {
  try {
    const {
      dataSet,
      pixelDataElement,
      rows,
      columns,
      bitsAllocated,
      bitsStored,
      pixelRepresentation,
      windowCenter,
      windowWidth,
      photometricInterpretation,
      rescaleSlope = 1,
      rescaleIntercept = 0
    } = dicomData;

    // 記錄處理參數
    console.log("處理DICOM影像:", {
      windowCenter,
      windowWidth,
      photometricInterpretation,
      rescaleSlope,
      rescaleIntercept
    });

    // 創建離屏Canvas用於處理圖像
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 設置Canvas尺寸與圖像尺寸相匹配
    canvas.width = columns;
    canvas.height = rows;

    // 創建圖像數據
    const imageData = ctx.createImageData(columns, rows);

    // 獲取像素數據
    let pixelData;
    const isUint16 = bitsAllocated === 16;

    try {
      if (isUint16) {
        // 16位像素數據
        if (pixelRepresentation === 0) {
          // 無符號整數
          pixelData = new Uint16Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length / 2);
        } else {
          // 有符號整數
          pixelData = new Int16Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length / 2);
        }
      } else {
        // 8位像素數據
        pixelData = new Uint8Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);
      }
    } catch (error) {
      console.error('創建像素數據時出錯:', error);
      throw new Error('處理像素數據失敗');
    }

    // 查找最小和最大像素值，應用 rescale 轉換
    let minHU = Number.MAX_VALUE;
    let maxHU = Number.MIN_VALUE;
    let minRaw = Number.MAX_VALUE;
    let maxRaw = Number.MIN_VALUE;

    // 安全遍歷像素數據
    try {
      // 遍歷像素並記錄範圍
      for (let i = 0; i < pixelData.length; i++) {
        const rawValue = pixelData[i];
        const huValue = rawValue * rescaleSlope + rescaleIntercept;

        if (rawValue < minRaw) minRaw = rawValue;
        if (rawValue > maxRaw) maxRaw = rawValue;
        if (huValue < minHU) minHU = huValue;
        if (huValue > maxHU) maxHU = huValue;
      }

      console.log("Pixel ranges:", {
        raw: { min: minRaw, max: maxRaw },
        hu: { min: minHU, max: maxHU }
      });
    } catch (error) {
      console.error('計算像素範圍時出錯:', error);
      // 設置默認範圍
      minRaw = 0;
      maxRaw = isUint16 ? 4095 : 255;
      minHU = rescaleIntercept;
      maxHU = maxRaw * rescaleSlope + rescaleIntercept;
    }

    // 使用指定的窗寬/窗位
    let effectiveWindowCenter = windowCenter;
    let effectiveWindowWidth = windowWidth;

    // 確保窗寬大於0
    if (effectiveWindowWidth <= 0) {
      effectiveWindowWidth = 256;
      console.log('窗寬設為默認值:', effectiveWindowWidth);
    }

    // 確定需要應用的變換 (基於光度解釋)
    const invert = photometricInterpretation === 'MONOCHROME1';

    // 計算窗口範圍
    const windowLow = effectiveWindowCenter - 0.5 * effectiveWindowWidth;
    const windowHigh = effectiveWindowCenter + 0.5 * effectiveWindowWidth;

    console.log("Window range:", { low: windowLow, high: windowHigh });

    try {
      // 轉換成ImageData格式
      let pixelIndex = 0;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const rawPixelValue = pixelData[pixelIndex];

          // 應用 rescale 轉換 (特別重要對於CT影像，將像素值轉換為HU值)
          const pixelValue = rawPixelValue * rescaleSlope + rescaleIntercept;

          // 窗口級別調整
          let adjustedValue;

          // 標準窗口級別調整
          if (pixelValue <= windowLow) {
            adjustedValue = 0;
          } else if (pixelValue > windowHigh) {
            adjustedValue = 255;
          } else {
            adjustedValue = Math.round(255 * (pixelValue - windowLow) / effectiveWindowWidth);
          }

          // 限制在 0-255 範圍內
          adjustedValue = Math.max(0, Math.min(255, adjustedValue));

          // 如果是 MONOCHROME1，則反轉亮度
          if (invert) {
            adjustedValue = 255 - adjustedValue;
          }

          const dataIndex = (y * columns + x) * 4;
          imageData.data[dataIndex] = adjustedValue;     // R
          imageData.data[dataIndex + 1] = adjustedValue; // G
          imageData.data[dataIndex + 2] = adjustedValue; // B
          imageData.data[dataIndex + 3] = 255;           // Alpha

          pixelIndex++;
        }
      }

      // 放置圖像數據到Canvas
      ctx.putImageData(imageData, 0, 0);
    } catch (error) {
      console.error('生成圖像數據時出錯:', error);
      throw new Error('無法生成圖像');
    }

    // 創建圖像對象並返回
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          resolve(img);
        };
        img.onerror = () => {
          reject(new Error('圖像生成失敗'));
        };
        img.src = canvas.toDataURL();
      } catch (error) {
        console.error('創建Image對象時出錯:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('創建DICOM圖像時發生錯誤:', error);
    throw error;
  }
};

/**
 * 繪製多邊形
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D上下文
 * @param {Array} points - 多邊形頂點數組
 * @param {boolean} isEditing - 是否處於編輯模式
 */
export const drawPolygon = (ctx, points, isEditing) => {
  console.log("drawPolygon 被呼叫，點數:", points.length);
  if (!ctx || !points || points.length === 0) return;

  try {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    // 👉 加上這行才會封閉形狀
    if (!isEditing && points.length >= 3) {
      ctx.closePath(); // 讓最後一點連回第一點
    }

    // 僅在非繪製中時閉合多邊形
    // if (points.length > 2 && !isEditing) {
    //   ctx.closePath();
    // }

    // 設置樣式
    ctx.strokeStyle = isEditing ? '#ff0000' : '#00ff00';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (points.length > 2) {
      ctx.fillStyle = isEditing ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)';
      ctx.fill();
    }

    // 第一點提示效果
    if (isEditing && points.length >= 3) {
      const firstPoint = points[0];
      ctx.beginPath();
      ctx.arc(firstPoint.x, firstPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 165, 0, 0.8)'; // 橘色半透明
      ctx.fill();
      ctx.strokeStyle = 'orange';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 繪製頂點
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = isEditing ? '#ff0000' : '#00ff00';
      ctx.fill();
    });
  } catch (error) {
    console.error('繪製多邊形時出錯:', error);
  }
};

/**
 * 繪製預設圖像
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D上下文
 * @param {number} width - Canvas寬度
 * @param {number} height - Canvas高度
 */
export const drawDefaultImage = (ctx, width, height) => {
  if (!ctx) return;

  try {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // 畫一個X
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 添加文字
    ctx.font = '20px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText('Dicom Image', width / 2, height / 2);
  } catch (error) {
    console.error('繪製默認圖像時出錯:', error);
  }
};

/**
 * 獲取預設窗寬/窗位設定
 */
export const getPresetWindows = () => {
  return {
    '腦': { center: 40, width: 80 },         // 腦CT窗
    '腹部': { center: 40, width: 400 },      // 腹部軟組織窗
    '肺': { center: -600, width: 1500 },     // 肺CT窗
    '縱隔': { center: 50, width: 350 },      // 縱隔窗（類似於您的DICOM預設）
    '骨頭': { center: 400, width: 1800 }     // 骨窗
  };
};