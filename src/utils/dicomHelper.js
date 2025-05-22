/**
 * utils/dicomHelper.js
 * 繪圖工具：drawPolygon、drawDefaultImage
 */

/**
 * 繪製多邊形
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D上下文
 * @param {Array} points - 多邊形頂點數組
 * @param {boolean} isEditing - 是否處於編輯模式
 */
export const drawPolygon = (ctx, points, isEditing) => {
  if (!ctx || !points || points.length === 0) return;

  try {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    if (!isEditing && points.length >= 3) {
      ctx.closePath();
    }

    ctx.strokeStyle = isEditing ? '#ff0000' : '#00ff00';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (points.length > 2) {
      ctx.fillStyle = isEditing ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)';
      ctx.fill();
    }

    if (isEditing && points.length >= 3) {
      const firstPoint = points[0];
      ctx.beginPath();
      ctx.arc(firstPoint.x, firstPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
      ctx.fill();
      ctx.strokeStyle = 'orange';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

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

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.stroke();

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
    '腦': { center: 40, width: 80 },
    '腹部': { center: 40, width: 400 },
    '肺': { center: -600, width: 1500 },
    '縱隔': { center: 50, width: 350 },
    '骨頭': { center: 400, width: 1800 }
  };
};