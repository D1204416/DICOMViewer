// src/components/DicomCanvas.jsx
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

  // 處理畫布點擊
  const handleCanvasClick = (e) => {
    if (!dicomFile) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
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
    if (!canvas || !dicomFile) return;
    
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
    <div className="canvas-container">
      <canvas 
        ref={canvasRef} 
        width={512} 
        height={512} 
        onClick={handleCanvasClick}
      />
    </div>
  );
};

export default DicomCanvas;