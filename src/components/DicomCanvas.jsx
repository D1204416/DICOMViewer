// src/components/DicomCanvas.jsx (具有縮放功能)
import React, { useEffect, useRef, useState } from 'react';
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
  
  // 縮放和平移狀態
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialRender, setInitialRender] = useState(true);

  // 重設縮放和平移狀態
  useEffect(() => {
    if (dicomFile && dicomImage) {
      // 當加載新的DICOM檔案時，重設狀態
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setInitialRender(true);
    }
  }, [dicomFile, dicomImage]);

  // 處理畫布點擊
  const handleCanvasClick = (e) => {
    if (!dicomFile || isDragging) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // 計算點擊位置相對於原始圖像的座標
    const x = (e.clientX - rect.left) / scale + offset.x;
    const y = (e.clientY - rect.top) / scale + offset.y;
    
    onClick({ x, y });
  };

  // 處理滑鼠滾輪縮放
  const handleWheel = (e) => {
    if (!dicomFile) return;
    
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // 滾輪向下縮小，向上放大
    const newScale = scale * delta;
    
    // 限制縮放範圍
    if (newScale < 0.1 || newScale > 10) return;
    
    // 計算滑鼠位置在原始圖像上的座標
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale + offset.x;
    const mouseY = (e.clientY - rect.top) / scale + offset.y;
    
    // 計算新的偏移量，使滑鼠位置保持在同一點
    const newOffsetX = mouseX - (e.clientX - rect.left) / (scale * delta);
    const newOffsetY = mouseY - (e.clientY - rect.top) / (scale * delta);
    
    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  // 處理拖動開始
  const handleMouseDown = (e) => {
    if (!dicomFile) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // 處理拖動
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // 計算新的偏移量
    const newOffsetX = offset.x - dx / scale;
    const newOffsetY = offset.y - dy / scale;
    
    setOffset({ x: newOffsetX, y: newOffsetY });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // 處理拖動結束
  const handleMouseUp = () => {
    setIsDragging(false);
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
    if (!canvas || !container || !dicomFile) return;
    
    // 首次渲染時計算初始縮放比例
    if (dicomImage && initialRender) {
      // 設定Canvas的畫布大小為影像的實際大小
      canvas.width = dicomImage.width;
      canvas.height = dicomImage.height;
      
      // 計算縮放比例，使影像能夠完整顯示在容器中
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const scaleX = containerWidth / dicomImage.width;
      const scaleY = containerHeight / dicomImage.height;
      const initialScale = Math.min(scaleX, scaleY, 1);
      
      setScale(initialScale);
      setInitialRender(false);
      return; // 等待下一次渲染
    }
    
    const ctx = canvas.getContext('2d');
    
    // 清除畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 使用縮放和平移進行繪製
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(-offset.x, -offset.y);
    
    // 繪製圖像
    if (dicomImage) {
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
    
    ctx.restore();
  }, [dicomFile, dicomImage, labels, currentPolygon, editingLabelIndex, scale, offset, initialRender]);

  return (
    <div
      ref={containerRef}
      className="canvas-container"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas 
        ref={canvasRef} 
        width={512} 
        height={512} 
        onClick={handleCanvasClick}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />
      {dicomFile && (
        <div className="zoom-info">
          縮放: {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
};

export default DicomCanvas;