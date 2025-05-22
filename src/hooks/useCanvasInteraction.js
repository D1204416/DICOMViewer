import { useState } from 'react';

export const useCanvasInteraction = ({
  canvasRef,
  canvasSize,
  dicomImage,
  labels,
  setLabels,
  isDrawing,
  editingLabelIndex,
  currentPolygon,
  setMousePosition,
}) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedPoint, setDraggedPoint] = useState(null);

  const getImageToCanvasRatio = () => ({
    x: dicomImage.width / canvasSize.width,
    y: dicomImage.height / canvasSize.height,
  });

  const handleMouseDown = (e) => {
    if (!dicomImage || e.button !== 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const { x: ratioX, y: ratioY } = getImageToCanvasRatio();
    const canvasX = x * ratioX + offset.x;
    const canvasY = y * ratioY + offset.y;

    if (editingLabelIndex !== -1) {
      const label = labels[editingLabelIndex];
      const pointIndex = label.points.findIndex(p => {
        const dx = p.x - canvasX;
        const dy = p.y - canvasY;
        return Math.sqrt(dx * dx + dy * dy) < 10;
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

  const handleMouseMove = (e) => {
    if (!dicomImage) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const { x: ratioX, y: ratioY } = getImageToCanvasRatio();
    const canvasX = x * ratioX + offset.x;
    const canvasY = y * ratioY + offset.y;

    if (draggedPoint) {
      const updatedLabels = [...labels];
      updatedLabels[draggedPoint.labelIndex].points[draggedPoint.pointIndex] = { x: canvasX, y: canvasY };
      setLabels(updatedLabels);
      return;
    }

    if (isDrawing) {
      setMousePosition({ x: canvasX, y: canvasY });
    }

    if (isDragging && !isDrawing && editingLabelIndex === -1) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const newOffsetX = offset.x - (dx / scale) * ratioX;
      const newOffsetY = offset.y - (dy / scale) * ratioY;
      setOffset({ x: newOffsetX, y: newOffsetY });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedPoint(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = scale * delta;
    if (newScale < 0.1 || newScale > 10) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const { x: ratioX, y: ratioY } = getImageToCanvasRatio();

    const mouseX = x * ratioX + offset.x;
    const mouseY = y * ratioY + offset.y;

    const newOffsetX = mouseX - x * ratioX * delta;
    const newOffsetY = mouseY - y * ratioY * delta;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  return {
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
  };
};