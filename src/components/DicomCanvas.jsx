import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { drawPolygon, drawDefaultImage } from '../utils/dicomHelper';
import { createDicomImage } from '../utils/dicomImageRenderer';
import WindowControls from './WindowControls';
import CanvasToolbar from './CanvasToolbar';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';

const DicomCanvas = ({
  dicomFile,
  dicomData,
  dicomImage,
  labels = [],
  currentPolygon = [],
  editingLabelIndex = -1,
  onClick,
  onImageUpdate,
  setLabels,
  isDrawing = false
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = React.useState({ width: 512, height: 512 });
  const [showControls, setShowControls] = React.useState(false);
  const [isInverted, setIsInverted] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState(null);

  const {
    scale,
    offset,
    setScale,
    setOffset,
    isDragging,
    setIsDragging,
    dragStart,
    setDragStart,
    draggedPoint,
    setDraggedPoint,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  } = useCanvasInteraction({
    canvasRef,
    canvasSize,
    dicomImage,
    labels,
    setLabels,
    isDrawing,
    editingLabelIndex,
    currentPolygon,
    setMousePosition,
  });

  const getCursorStyle = () => {
    if (isDrawing || editingLabelIndex !== -1) return 'default';
    if (isDragging) return 'grabbing';
    return 'grab';
  };

  useLayoutEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const aspectRatio = dicomImage ? dicomImage.height / dicomImage.width : 1;
        let newWidth = containerWidth - 40;
        let newHeight = newWidth * aspectRatio;
        if (newHeight > containerHeight - 40) {
          newHeight = containerHeight - 40;
          newWidth = newHeight / aspectRatio;
        }
        setCanvasSize({ width: Math.floor(newWidth), height: Math.floor(newHeight) });
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [containerRef, dicomImage]);

  useEffect(() => {
    if (dicomFile && dicomImage) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setShowControls(true);
      setIsInverted(false);
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [dicomFile, dicomImage]);

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

    if (isDrawing && currentPolygon.length > 2) {
      const firstPoint = currentPolygon[0];
      const dx = x - firstPoint.x;
      const dy = y - firstPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 10) {
        onClick(null, true);
        return;
      }
    }
    if (isDrawing) onClick({ x, y });
  };

  const handleWindowChange = async (newCenter, newWidth, toggleInvert = false) => {
    if (!dicomData) return;
    if (toggleInvert) {
      setIsInverted(!isInverted);
      const updatedDicomData = {
        ...dicomData,
        photometricInterpretation: isInverted ? 'MONOCHROME2' : 'MONOCHROME1'
      };
      try {
        const newImage = await createDicomImage(updatedDicomData);
        onImageUpdate?.(newImage, updatedDicomData);
      } catch (error) {
        console.error('反轉影像時發生錯誤:', error);
      }
      return;
    }

    const updatedDicomData = {
      ...dicomData,
      windowCenter: newCenter,
      windowWidth: newWidth,
      photometricInterpretation: isInverted ? 'MONOCHROME1' : 'MONOCHROME2'
    };
    try {
      const newImage = await createDicomImage(updatedDicomData);
      onImageUpdate?.(newImage, updatedDicomData);
    } catch (error) {
      console.error('窗寬/窗位調整時發生錯誤:', error);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    if (!dicomFile) {
      drawDefaultImage(ctx, canvas.width, canvas.height);
      return;
    }
    if (!dicomImage) return;

    const imageToCanvasRatioX = dicomImage.width / canvasSize.width;
    const imageToCanvasRatioY = dicomImage.height / canvasSize.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);
    ctx.drawImage(
      dicomImage,
      offset.x, offset.y,
      canvasSize.width * imageToCanvasRatioX / scale,
      canvasSize.height * imageToCanvasRatioY / scale,
      0, 0,
      canvasSize.width / scale,
      canvasSize.height / scale
    );

    const adjustPoint = (point) => ({
      x: (point.x - offset.x) / imageToCanvasRatioX,
      y: (point.y - offset.y) / imageToCanvasRatioY
    });

    labels.forEach((label, index) => {
      const adjustedPoints = label.points.map(adjustPoint);
      drawPolygon(ctx, adjustedPoints, index === editingLabelIndex);
    });

    if (currentPolygon.length > 0) {
      const adjustedPoints = currentPolygon.map(adjustPoint);
      drawPolygon(ctx, adjustedPoints, true);

      if (isDrawing && mousePosition) {
        const lastPoint = adjustPoint(currentPolygon[currentPolygon.length - 1]);
        const previewPoint = adjustPoint(mousePosition);
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(previewPoint.x, previewPoint.y);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    ctx.restore();
  }, [dicomFile, dicomImage, labels, currentPolygon, editingLabelIndex, scale, offset, canvasSize, mousePosition]);

  return (
    <div
      ref={containerRef}
      className="canvas-container"
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
        style={{ cursor: getCursorStyle(), display: 'block', margin: 'auto' }}
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
        <div className="zoom-info">縮放: {Math.round(scale * 100)}%</div>
      )}
      {showControls && dicomFile && !isDrawing && editingLabelIndex === -1 && (
        <div className="controls-hint"><p>按住左鍵: 拖動</p></div>
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
        <CanvasToolbar
          setScale={setScale}
          setOffset={setOffset}
          handleWindowChange={handleWindowChange}
        />
      )}
    </div>
  );
};

export default DicomCanvas;