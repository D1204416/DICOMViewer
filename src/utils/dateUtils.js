// src/utils/dateUtils.js
/**
 * 從 DICOM 日期格式字符串解析日期
 * @param {string} dicomDate - DICOM 格式的日期，通常為 YYYYMMDD
 * @returns {Date|null} - 解析後的 Date 對象，失敗則返回 null
 */
export const parseDicomDate = (dicomDate) => {
  if (!dicomDate || typeof dicomDate !== 'string') {
    return null;
  }
  
  dicomDate = dicomDate.trim();
  
  // 標準 DICOM 日期格式: YYYYMMDD
  if (/^\d{8}$/.test(dicomDate)) {
    const year = parseInt(dicomDate.substring(0, 4), 10);
    const month = parseInt(dicomDate.substring(4, 6), 10) - 1; // JavaScript 月份從 0 開始
    const day = parseInt(dicomDate.substring(6, 8), 10);
    
    // 檢查日期有效性
    if (month < 0 || month > 11 || day < 1 || day > 31) {
      console.log('無效的日期值:', year, month + 1, day);
      return null;
    }
    
    return new Date(year, month, day);
  }
  
  // 處理其他可能的格式
  
  // 格式: YYYY.MM.DD
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(dicomDate)) {
    const parts = dicomDate.split('.');
    return new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
  }
  
  // 格式: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dicomDate)) {
    return new Date(dicomDate);
  }
  
  // 格式: DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dicomDate)) {
    const parts = dicomDate.split('/');
    return new Date(
      parseInt(parts[2], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[0], 10)
    );
  }
  
  // 嘗試使用瀏覽器的默認日期解析
  const date = new Date(dicomDate);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  console.log('無法解析的日期格式:', dicomDate);
  return null;
};

/**
 * 從出生日期計算年齡
 * @param {string} birthdate - 出生日期字符串，支持多種格式
 * @returns {string} - 計算出的年齡或 "Unknown"
 */
export const calculateAge = (birthdate) => {
  if (!birthdate || birthdate === 'Unknown') {
    console.log('出生日期不可用');
    return 'Unknown';
  }
  
  try {
    console.log('嘗試從出生日期計算年齡:', birthdate);
    const birthDate = parseDicomDate(birthdate);
    if (!birthDate) {
      console.log('無法解析出生日期');
      return 'Unknown';
    }
    
    const today = new Date();
    
    // 計算年齡（精確計算）
    let age = today.getFullYear() - birthDate.getFullYear();
    
    // 檢查今年的生日是否已經過了
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // 檢查年齡是否合理
    if (age < 0 || age > 150) {
      console.log('計算出的年齡不合理:', age);
      return 'Unknown';
    }
    
    console.log('成功計算年齡:', age);
    return age.toString();
  } catch (error) {
    console.error('計算年齡時發生錯誤:', error);
    return 'Unknown';
  }
};

/**
 * 格式化日期為更易讀的形式
 * @param {string} dicomDate - DICOM 格式的日期
 * @returns {string} - 格式化後的日期，例如 "YYYY-MM-DD"
 */
export const formatDate = (dicomDate) => {
  if (!dicomDate || dicomDate === 'Unknown') {
    return 'Unknown';
  }
  
  const date = parseDicomDate(dicomDate);
  if (!date) {
    return dicomDate; // 如果無法解析，返回原始字符串
  }
  
  // 格式化為 YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};