// src/utils/dicomHelper.js - 優化 DICOM 解析功能

import * as dicomParser from 'dicom-parser';

/**
 * 解析 DICOM 檔案，提取患者信息和圖像數據
 * @param {ArrayBuffer} arrayBuffer - DICOM 檔案的 ArrayBuffer
 * @returns {Object} 包含解析結果的對象
 */
export const parseDicomFile = (arrayBuffer) => {
  try {
    const byteArray = new Uint8Array(arrayBuffer);
    const dataSet = dicomParser.parseDicom(byteArray);
    
    // 解析患者信息
    const patientData = {
      patientName: dataSet.string('x00100010') || 'Unknown',
      birthdate: dataSet.string('x00100030') || 'Unknown',
      age: dataSet.string('x00101010') || 'Unknown',
      sex: dataSet.string('x00100040') || 'Unknown'
    };
    
    // 處理影像數據
    const pixelDataElement = dataSet.elements.x7fe00010;
    
    if (!pixelDataElement) {
      throw new Error('無法找到像素數據');
    }
    
    // 獲取重要的影像參數
    const rows = dataSet.uint16('x00280010');
    const columns = dataSet.uint16('x00280011');
    const bitsAllocated = dataSet.uint16('x00280100') || 8;
    const bitsStored = dataSet.uint16('x00280101') || 8;
    const highBit = dataSet.uint16('x00280102') || 7;
    const pixelRepresentation = dataSet.uint16('x00280103') || 0;
    const samplesPerPixel = dataSet.uint16('x00280002') || 1;
    const planarConfiguration = dataSet.uint16('x00280006') || 0;
    const photometricInterpretation = dataSet.string('x00280004') || 'MONOCHROME2';
    
    // 獲取窗口寬度和中心值 (如果有的話)
    let windowCenter = dataSet.floatString('x00281050', 0) || 127;
    let windowWidth = dataSet.floatString('x00281051', 0) || 256;
    
    // 如果窗口值是陣列，取第一個值
    if (Array.isArray(windowCenter)) windowCenter = windowCenter[0];
    if (Array.isArray(windowWidth)) windowWidth = windowWidth[0];
    
    // 檢查 transfer syntax UID，以確定是否是壓縮的 DICOM
    const transferSyntaxUID = dataSet.string('x00020010') || '1.2.840.10008.1.2'; // 默認為隱式 VR 小端
    
    console.log("DICOM Info:", {
      rows,
      columns,
      bitsAllocated,
      bitsStored,
      highBit,
      pixelRepresentation,
      samplesPerPixel,
      planarConfiguration,
      photometricInterpretation,
      windowCenter,
      windowWidth,
      transferSyntaxUID
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
  const {
    dataSet,
    pixelDataElement,
    rows,
    columns,
    bitsAllocated,
    pixelRepresentation,
    windowCenter,
    windowWidth,
    photometricInterpretation
  } = dicomData;
  
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
  
  // 查找最小和最大像素值，用於自動窗口調整
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;
  
  for (let i = 0; i < pixelData.length; i++) {
    if (pixelData[i] < min) min = pixelData[i];
    if (pixelData[i] > max) max = pixelData[i];
  }
  
  // 如果沒有設置窗口值或窗口值不合理，使用計算出的最小/最大值
  if (windowWidth <= 0 || windowCenter < min || windowCenter > max) {
    windowWidth = max - min;
    windowCenter = min + windowWidth / 2;
  }
  
  console.log("Pixel range:", { min, max, windowCenter, windowWidth });
  
  // 確定需要應用的變換 (基於光度解釋)
  const invert = photometricInterpretation === 'MONOCHROME1';
  
  // 轉換成ImageData格式
  let pixelIndex = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const pixelValue = pixelData[pixelIndex];
      
      // 簡單的窗口級別調整
      let adjustedValue;
      
      if (windowWidth === 0) {
        // 避免除以零
        adjustedValue = pixelValue >= windowCenter ? 255 : 0;
      } else {
        // 標準窗口級別調整
        adjustedValue = 255 * (pixelValue - (windowCenter - 0.5 * windowWidth)) / windowWidth;
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
  
  // 創建圖像對象並返回
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.src = canvas.toDataURL();
  });
};

/**
 * 繪製多邊形
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D上下文
 * @param {Array} points - 多邊形頂點數組
 * @param {boolean} isEditing - 是否處於編輯模式
 */
export const drawPolygon = (ctx, points, isEditing) => {
  if (!points || points.length === 0) return;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  // 閉合多邊形
  if (points.length > 2) {
    ctx.closePath();
  }
  
  // 設置樣式
  ctx.strokeStyle = isEditing ? '#ff0000' : '#00ff00';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  if (points.length > 2) {
    ctx.fillStyle = isEditing ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)';
    ctx.fill();
  }
  
  // 繪製頂點
  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = isEditing ? '#ff0000' : '#00ff00';
    ctx.fill();
  });
};

/**
 * 繪製預設圖像
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D上下文
 * @param {number} width - Canvas寬度
 * @param {number} height - Canvas高度
 */
export const drawDefaultImage = (ctx, width, height) => {
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
};