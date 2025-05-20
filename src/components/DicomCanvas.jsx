// src/components/DicomCanvas.jsx (修改版)
import React, { useEffect, useRef } from 'react';
import { drawPolygon, drawDefaultImage } from '../utils/dicomHelper';

const DicomCanvas = ({ 
  dicomFile, 
  dicomImage, 
  labels = [], 
  currentPolygon = [], 
  editingLabelIndex = -1, 
  onClick 
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // 處理畫布點擊
  const handleCanvasClick = (e) => {
    if (!dicomFile) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // 計算點擊位置相對於縮放後的Canvas的座標
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    onClick({ x, y });
  };

  // 當沒有檔案時，繪製預設界面
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!dicomFile) {
      const ctx = canvas.getContext('2d');
      drawDefaultImage(ctx, canvas.width, canvas.height);
    }
  }, [dicomFile]);

  // 更新 Canvas 顯示
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    // 當有DICOM檔案時，調整Canvas大小以適應容器
    if (dicomFile && dicomImage) {
      // 獲取容器的尺寸
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // 設定Canvas的畫布大小為影像的實際大小
      canvas.width = dicomImage.width;
      canvas.height = dicomImage.height;
      
      // 計算縮放比例，使影像能夠完整顯示在容器中
      const scaleX = containerWidth / dicomImage.width;
      const scaleY = containerHeight / dicomImage.height;
      const scale = Math.min(scaleX, scaleY, 1); // 不要放大，只縮小
      
      // 設定Canvas的顯示大小
      canvas.style.width = `${dicomImage.width * scale}px`;
      canvas.style.height = `${dicomImage.height * scale}px`;
      
      // 讓Canvas在容器中居中
      canvas.style.display = 'block';
      canvas.style.margin = 'auto';
    }
    
    if (!dicomFile) return;
    
    const ctx = canvas.getContext('2d');
    
    // 首先繪製圖像
    if (dicomImage) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(dicomImage, 0, 0);
    }
    
    // 繪製所有現有標記
    labels.forEach((label, index) => {
      drawPolygon(ctx, label.points, index === editingLabelIndex);
    });
    
    // 繪製目前正在繪製的多邊形
    if (currentPolygon.length > 0) {
      drawPolygon(ctx, currentPolygon, true);
    }
  }, [dicomFile, dicomImage, labels, currentPolygon, editingLabelIndex]);

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas 
        ref={canvasRef} 
        width={512} 
        height={512} 
        onClick={handleCanvasClick}
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
};

export default DicomCanvas;