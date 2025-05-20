// src/utils/dicomHelper.js
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
    
    const rows = dataSet.uint16('x00280010');
    const columns = dataSet.uint16('x00280011');
    
    // 獲取視窗寬度和中心值
    const windowCenter = dataSet.string('x00281050') || 127;
    const windowWidth = dataSet.string('x00281051') || 256;
    
    return {
      dataSet,
      pixelDataElement,
      rows,
      columns,
      windowCenter,
      windowWidth,
      patientData
    };
  } catch (error) {
    console.error('解析 DICOM 檔案時發生錯誤:', error);
    throw error;
  }
};

/**
 * 從 DICOM 數據集創建圖像
 * @param {Object} dataSet - DICOM 數據集
 * @param {Object} pixelDataElement - 像素數據元素
 * @param {number} rows - 圖像行數
 * @param {number} columns - 圖像列數
 * @param {number} windowCenter - 窗口中心值
 * @param {number} windowWidth - 窗口寬度
 * @returns {HTMLImageElement} 處理後的圖像
 */
export const createDicomImage = (dataSet, pixelDataElement, rows, columns, windowCenter, windowWidth) => {
  // 創建離屏Canvas用於處理圖像
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 設置Canvas尺寸與圖像尺寸相匹配
  canvas.width = columns;
  canvas.height = rows;
  
  // 創建圖像數據
  const imageData = ctx.createImageData(columns, rows);
  
  // 獲取像素數據
  const pixelData = new Uint8Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);
  
  // 轉換成ImageData格式
  for (let i = 0; i < pixelData.length; i++) {
    const pixelValue = pixelData[i];
    
    // 簡單的窗口級別調整
    let adjustedValue = ((pixelValue - windowCenter) / windowWidth + 0.5) * 255;
    adjustedValue = Math.max(0, Math.min(255, adjustedValue));
    
    imageData.data[i * 4] = adjustedValue;     // R
    imageData.data[i * 4 + 1] = adjustedValue; // G
    imageData.data[i * 4 + 2] = adjustedValue; // B
    imageData.data[i * 4 + 3] = 255;          // Alpha
  }
  
  // 放置圖像數據到Canvas
  ctx.putImageData(imageData, 0, 0);
  
  // 創建圖像對象並返回
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
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