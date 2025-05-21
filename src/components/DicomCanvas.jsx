// src/components/DicomCanvas.jsx (優化鼠標光標模式)
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { drawPolygon, drawDefaultImage, createDicomImage } from '../utils/dicomHelper';
import WindowControls from './WindowControls';

const DicomCanvas = ({
  dicomFile,
  dicomData,
  dicomImage,
  labels = [],
  currentPolygon = [],
  editingLabelIndex = -1,
  onClick,
  onImageUpdate,
  isDrawing = false
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [draggedPoint, setDraggedPoint] = useState(null); // { labelIndex, pointIndex }


  // 縮放和平移狀態
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialRender, setInitialRender] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 512, height: 512 });

  // 窗寬/窗位相關狀態
  const [isInverted, setIsInverted] = useState(false);

  // 決定光標樣式的函數
  const getCursorStyle = () => {
    // 如果正在繪製或編輯標記，則顯示箭頭光標
    if (isDrawing || editingLabelIndex !== -1) {
      return 'default';  // 默認箭頭光標
    }

    // 如果正在拖動，則顯示抓取光標
    if (isDragging) {
      return 'grabbing';
    }

    // 否則顯示可抓取光標
    return 'grab';
  };

  // 調整Canvas大小適應容器
  useLayoutEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // 保持容器的寬度，計算等比例的高度
        const aspectRatio = dicomImage ? dicomImage.height / dicomImage.width : 1;
        let newWidth = containerWidth - 40; // 留一點邊距
        let newHeight = newWidth * aspectRatio;

        // 如果計算出的高度超過容器高度，則根據高度重新計算
        if (newHeight > containerHeight - 40) {
          newHeight = containerHeight - 40;
          newWidth = newHeight / aspectRatio;
        }

        // 設定Canvas的大小
        setCanvasSize({
          width: Math.floor(newWidth),
          height: Math.floor(newHeight)
        });
      }
    };

    // 初始化時調整大小
    updateCanvasSize();

    // 當窗口大小變化時重新計算
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [containerRef, dicomImage]);

  // 重設縮放和平移狀態
  useEffect(() => {
    if (dicomFile && dicomImage) {
      // 當加載新的DICOM檔案時，重設狀態
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setInitialRender(true);
      setShowControls(true);
      setIsInverted(false);

      // 3秒後隱藏控制提示
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [dicomFile, dicomImage]);

  // 處理畫布點擊
  const handleCanvasClick = (e) => {
    if (!dicomFile) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const imageToCanvasRatioX = dicomImage.width / canvasSize.width;
    const imageToCanvasRatioY = dicomImage.height / canvasSize.height;

    const canvasX = (e.clientX - rect.left) / scale;
    const canvasY = (e.clientY - rect.top) / scale;

    const x = canvasX * imageToCanvasRatioX + offset.x;
    const y = canvasY * imageToCanvasRatioY + offset.y;

    // 禁止在編輯模式下新增點
    if (isDrawing) {
      onClick({ x, y });
    }
  };


  // 處理滑鼠滾輪縮放
  const handleWheel = (e) => {
    if (!dicomFile || isDrawing || editingLabelIndex !== -1) return;

    e.preventDefault();

    const delta = e.deltaY > 0 ? 0.9 : 1.1; // 滾輪向下縮小，向上放大
    const newScale = scale * delta;

    // 限制縮放範圍
    if (newScale < 0.1 || newScale > 10) return;

    // 計算滑鼠位置在原始圖像上的座標
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const imageToCanvasRatioX = dicomImage.width / canvasSize.width;
    const imageToCanvasRatioY = dicomImage.height / canvasSize.height;

    const canvasX = (e.clientX - rect.left) / scale;
    const canvasY = (e.clientY - rect.top) / scale;

    const mouseX = canvasX * imageToCanvasRatioX + offset.x;
    const mouseY = canvasY * imageToCanvasRatioY + offset.y;

    // 計算新的偏移量，使滑鼠位置保持在同一點
    const newOffsetX = mouseX - canvasX * imageToCanvasRatioX * delta;
    const newOffsetY = mouseY - canvasY * imageToCanvasRatioY * delta;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  // 處理拖動開始
const handleMouseDown = (e) => {
  if (!dicomFile) return;
  if (e.button !== 0) return;

  const rect = canvasRef.current.getBoundingClientRect();
  const x = (e.clientX - rect.left) / scale;
  const y = (e.clientY - rect.top) / scale;

  const imageToCanvasRatioX = dicomImage.width / canvasSize.width;
  const imageToCanvasRatioY = dicomImage.height / canvasSize.height;

  const canvasX = x * imageToCanvasRatioX + offset.x;
  const canvasY = y * imageToCanvasRatioY + offset.y;

  // 拖移編輯點位
  if (editingLabelIndex !== -1) {
    const label = labels[editingLabelIndex];
    const pointIndex = label.points.findIndex(p => {
      const dx = p.x - canvasX;
      const dy = p.y - canvasY;
      return Math.sqrt(dx * dx + dy * dy) < 10; // 點擊半徑 10px
    });

    if (pointIndex !== -1) {
      setDraggedPoint({ labelIndex: editingLabelIndex, pointIndex });
      return;
    }
  }

  if (!isDrawing && editingLabelIndex === -1) {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }
};



  // 處理拖動
const handleMouseMove = (e) => {
  if (draggedPoint) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const imageToCanvasRatioX = dicomImage.width / canvasSize.width;
    const imageToCanvasRatioY = dicomImage.height / canvasSize.height;

    const newX = x * imageToCanvasRatioX + offset.x;
    const newY = y * imageToCanvasRatioY + offset.y;

    const updatedLabels = [...labels];
    updatedLabels[draggedPoint.labelIndex].points[draggedPoint.pointIndex] = { x: newX, y: newY };
    setLabels(updatedLabels);
    return;
  }

  if (!isDragging || isDrawing || editingLabelIndex !== -1) return;

  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;

  const imageToCanvasRatioX = dicomImage.width / canvasSize.width;
  const imageToCanvasRatioY = dicomImage.height / canvasSize.height;

  const newOffsetX = offset.x - (dx / scale) * imageToCanvasRatioX;
  const newOffsetY = offset.y - (dy / scale) * imageToCanvasRatioY;

  setOffset({ x: newOffsetX, y: newOffsetY });
  setDragStart({ x: e.clientX, y: e.clientY });
};


  // 處理拖動結束
  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedPoint(null);
  };

  // 處理窗寬/窗位變化
  const handleWindowChange = async (newCenter, newWidth, toggleInvert = false) => {
    if (!dicomData) return;

    // 如果是切換反轉
    if (toggleInvert) {
      setIsInverted(!isInverted);

      // 處理反轉
      const updatedDicomData = {
        ...dicomData,
        // 切換光度解釋
        photometricInterpretation: isInverted ?
          'MONOCHROME2' : 'MONOCHROME1'
      };

      try {
        // 重新生成影像
        const newImage = await createDicomImage(updatedDicomData);
        // 如果父組件提供了更新函數，則調用它
        if (onImageUpdate) {
          onImageUpdate(newImage, updatedDicomData);
        } else {
          // 否則直接重繪
          redrawCanvas(newImage);
        }
      } catch (error) {
        console.error('反轉影像時發生錯誤:', error);
      }

      return;
    }

    // 創建應用了新窗寬/窗位的圖像
    const updatedDicomData = {
      ...dicomData,
      windowCenter: newCenter,
      windowWidth: newWidth,
      photometricInterpretation: isInverted ? 'MONOCHROME1' : 'MONOCHROME2'
    };

    try {
      // 重新生成影像
      const newImage = await createDicomImage(updatedDicomData);
      // 如果父組件提供了更新函數，則調用它
      if (onImageUpdate) {
        onImageUpdate(newImage, updatedDicomData);
      } else {
        // 否則直接重繪
        redrawCanvas(newImage);
      }
    } catch (error) {
      console.error('窗寬/窗位調整時發生錯誤:', error);
    }
  };

  // 在畫布上重繪影像和標記
  const redrawCanvas = (image) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);

    // 計算圖像縮放比例
    const imageToCanvasRatioX = image.width / canvasSize.width;
    const imageToCanvasRatioY = image.height / canvasSize.height;

    // 繪製影像時考慮偏移和縮放
    ctx.drawImage(
      image,
      offset.x, offset.y,
      canvasSize.width * imageToCanvasRatioX / scale,
      canvasSize.height * imageToCanvasRatioY / scale,
      0, 0,
      canvasSize.width / scale,
      canvasSize.height / scale
    );

    // 繪製標記，考慮偏移和縮放
    if (labels.length > 0 || currentPolygon.length > 0) {
      // 繪製標記時需要調整座標
      const adjustPoint = (point) => ({
        x: (point.x - offset.x) / imageToCanvasRatioX,
        y: (point.y - offset.y) / imageToCanvasRatioY
      });

      // 繪製已有標記
      labels.forEach((label, index) => {
        const adjustedPoints = label.points.map(adjustPoint);
        drawPolygon(ctx, adjustedPoints, index === editingLabelIndex);
      });

      // 繪製當前正在繪製的多邊形
      if (currentPolygon.length > 0) {
        const adjustedPoints = currentPolygon.map(adjustPoint);
        drawPolygon(ctx, adjustedPoints, true);
      }
    }

    ctx.restore();
  };

  // 快速導航到區域
  const navigateTo = (position) => {
    if (!dicomImage) return;

    const imageToCanvasRatioX = dicomImage.width / canvasSize.width;
    const imageToCanvasRatioY = dicomImage.height / canvasSize.height;

    let targetX = offset.x;
    let targetY = offset.y;

    switch (position) {
      case 'center':
        targetX = (dicomImage.width - canvasSize.width * imageToCanvasRatioX / scale) / 2;
        targetY = (dicomImage.height - canvasSize.height * imageToCanvasRatioY / scale) / 2;
        break;
      case 'top-left':
        targetX = 0;
        targetY = 0;
        break;
      case 'top-right':
        targetX = dicomImage.width - canvasSize.width * imageToCanvasRatioX / scale;
        targetY = 0;
        break;
      case 'bottom-left':
        targetX = 0;
        targetY = dicomImage.height - canvasSize.height * imageToCanvasRatioY / scale;
        break;
      case 'bottom-right':
        targetX = dicomImage.width - canvasSize.width * imageToCanvasRatioX / scale;
        targetY = dicomImage.height - canvasSize.height * imageToCanvasRatioY / scale;
        break;
      case 'fit':
        setScale(1);
        targetX = 0;
        targetY = 0;
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
    if (!canvas || !container) return;

    // 設置Canvas的顯示尺寸
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    if (!dicomFile) {
      const ctx = canvas.getContext('2d');
      drawDefaultImage(ctx, canvas.width, canvas.height);
      return;
    }

    if (!dicomImage) return;

    const ctx = canvas.getContext('2d');

    // 清除畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 繪製影像，考慮偏移和縮放
    const imageToCanvasRatioX = dicomImage.width / canvasSize.width;
    const imageToCanvasRatioY = dicomImage.height / canvasSize.height;

    ctx.save();
    ctx.scale(scale, scale);

    // 繪製調整後的影像
    ctx.drawImage(
      dicomImage,
      offset.x, offset.y,
      canvasSize.width * imageToCanvasRatioX / scale,
      canvasSize.height * imageToCanvasRatioY / scale,
      0, 0,
      canvasSize.width / scale,
      canvasSize.height / scale
    );

    // 繪製標記，考慮偏移和縮放
    if (labels.length > 0 || currentPolygon.length > 0) {
      // 繪製標記時需要調整座標
      const adjustPoint = (point) => ({
        x: (point.x - offset.x) / imageToCanvasRatioX,
        y: (point.y - offset.y) / imageToCanvasRatioY
      });

      // 繪製已有標記
      labels.forEach((label, index) => {
        const adjustedPoints = label.points.map(adjustPoint);
        drawPolygon(ctx, adjustedPoints, index === editingLabelIndex);
      });

      // 繪製當前正在繪製的多邊形
      if (currentPolygon.length > 0) {
        const adjustedPoints = currentPolygon.map(adjustPoint);
        drawPolygon(ctx, adjustedPoints, true);
      }
    }

    ctx.restore();

  }, [dicomFile, dicomImage, labels, currentPolygon, editingLabelIndex, scale, offset, canvasSize]);

  // 鍵盤快捷鍵
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!dicomFile) return;

      // 如果正在繪製或編輯標記，不處理導航快捷鍵
      if (isDrawing || editingLabelIndex !== -1) return;

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
          if (!isDrawing && editingLabelIndex === -1) {
            setScale(prev => Math.min(prev * 1.1, 10));
          }
          break;
        case '-':
          if (!isDrawing && editingLabelIndex === -1) {
            setScale(prev => Math.max(prev * 0.9, 0.1));
          }
          break;
        case 'i':
          // 快速反轉影像
          handleWindowChange(null, null, true);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dicomFile, offset, dicomData, isInverted, isDrawing, editingLabelIndex]);

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
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        style={{
          cursor: getCursorStyle(),
          display: 'block',
          margin: 'auto'
        }}
      />

      {dicomFile && dicomData && (
        <WindowControls
          dicomFile={dicomFile}
          initialWindowCenter={dicomData.windowCenter}
          initialWindowWidth={dicomData.windowWidth}
          onWindowChange={handleWindowChange}
        />
      )}

      {dicomFile && (
        <div className="zoom-info">
          縮放: {Math.round(scale * 100)}%
        </div>
      )}

      {showControls && dicomFile && !isDrawing && editingLabelIndex === -1 && (
        <div className="controls-hint">
          <p>滑鼠滾輪: 縮放</p>
          <p>按住左鍵: 拖動</p>
          <p>快捷鍵: 0 (重置), 1 (適合), 2 (居中), + (放大), - (縮小), i (反轉)</p>
        </div>
      )}

      {isDrawing && (
        <div className="controls-hint">
          <p>標記模式: 點擊添加多邊形頂點</p>
          <p>完成後請點擊「完成繪製」按鈕</p>
        </div>
      )}

      {editingLabelIndex !== -1 && (
        <div className="controls-hint">
          <p>編輯模式: 點擊添加更多頂點</p>
          <p>完成後請點擊「完成編輯」按鈕</p>
        </div>
      )}

      {dicomFile && !isDrawing && editingLabelIndex === -1 && (
        <div className="navigation-controls">
          <button onClick={() => navigateTo('fit')} title="適合視窗 (1)">🔍</button>
          <button onClick={resetView} title="重置 (0)">↺</button>
          <button onClick={() => setScale(prev => Math.min(prev * 1.1, 10))} title="放大 (+)">+</button>
          <button onClick={() => setScale(prev => Math.max(prev * 0.9, 0.1))} title="縮小 (-)">-</button>
          <button onClick={() => handleWindowChange(null, null, true)} title="反轉 (i)">◐</button>
        </div>
      )}
    </div>
  );
};

export default DicomCanvas;