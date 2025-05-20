// src/components/DicomCanvas.jsx (完整優化版)
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
  const [showControls, setShowControls] = useState(false);
  
  // 重設縮放和平移狀態
  useEffect(() => {
    if (dicomFile && dicomImage) {
      // 當加載新的DICOM檔案時，重設狀態
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setInitialRender(true);
      setShowControls(true);
      
      // 5秒後隱藏控制提示
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 5000);
      
      return () => clearTimeout(timer);
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
    
    // 只有使用滑鼠左鍵時才啟動拖動
    if (e.button !== 0) return;
    
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
  
  // 快速導航到區域
  const navigateTo = (position) => {
    if (!dicomImage) return;
    
    let targetX = offset.x;
    let targetY = offset.y;
    
    switch (position) {
      case 'center':
        targetX = dicomImage.width / 2 - window.innerWidth / (2 * scale);
        targetY = dicomImage.height / 2 - window.innerHeight / (2 * scale);
        break;
      case 'top-left':
        targetX = 0;
        targetY = 0;
        break;
      case 'top-right':
        targetX = dicomImage.width - window.innerWidth / scale;
        targetY = 0;
        break;
      case 'bottom-left':
        targetX = 0;
        targetY = dicomImage.height - window.innerHeight / scale;
        break;
      case 'bottom-right':
        targetX = dicomImage.width - window.innerWidth / scale;
        targetY = dicomImage.height - window.innerHeight / scale;
        break;
      case 'fit':
        // 計算適合窗口的縮放比例
        const container = containerRef.current;
        if (container && dicomImage) {
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          const scaleX = containerWidth / dicomImage.width;
          const scaleY = containerHeight / dicomImage.height;
          const newScale = Math.min(scaleX, scaleY, 1);
          
          setScale(newScale);
          targetX = 0;
          targetY = 0;
        }
        break;
      default:
        break;
    }
    
    setOffset({ x: targetX, y: targetY });
  };
  
  // 重置視圖
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
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
  
  // 鍵盤快捷鍵
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!dicomFile) return;
      
      switch (e.key) {
        case '0':
          resetView();
          break;
        case '1':
          navigateTo('fit');
          break;
        case '2':
          navigateTo('center');
          break;
        case '3':
          navigateTo('top-left');
          break;
        case '4':
          navigateTo('top-right');
          break;
        case '5':
          navigateTo('bottom-left');
          break;
        case '6':
          navigateTo('bottom-right');
          break;
        case '+':
        case '=':
          setScale(prev => Math.min(prev * 1.1, 10));
          break;
        case '-':
          setScale(prev => Math.max(prev * 0.9, 0.1));
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dicomFile, offset]);
  
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
      
      {showControls && dicomFile && (
        <div className="controls-hint">
          <p>滑鼠滾輪: 縮放</p>
          <p>按住左鍵: 拖動</p>
          <p>快捷鍵: 0 (重置), 1 (適合), 2 (居中), + (放大), - (縮小)</p>
        </div>
      )}
      
      {dicomFile && (
        <div className="navigation-controls">
          <button onClick={() => navigateTo('fit')} title="適合視窗 (1)">🔍</button>
          <button onClick={resetView} title="重置 (0)">↺</button>
          <button onClick={() => setScale(prev => Math.min(prev * 1.1, 10))} title="放大 (+)">+</button>
          <button onClick={() => setScale(prev => Math.max(prev * 0.9, 0.1))} title="縮小 (-)">-</button>
        </div>
      )}
    </div>
  );
};

export default DicomCanvas;