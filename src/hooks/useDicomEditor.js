import { useState } from 'react';

export const useDicomEditor = () => {
  const [labels, setLabels] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [editingLabelIndex, setEditingLabelIndex] = useState(-1);
  const [originalLabelBackup, setOriginalLabelBackup] = useState(null);

  const addLabel = () => {
    setIsDrawing(true);
    setCurrentPolygon([]);
    setEditingLabelIndex(-1);
  };

  const finishDrawing = () => {
    if (currentPolygon.length > 2) {
      const newLabel = {
        id: Date.now(),
        points: [...currentPolygon],
      };
      setLabels(prev => [...prev, newLabel]);
    } else {
      alert('多邊形需要至少3個點。已取消繪製。');
    }
    setIsDrawing(false);
    setCurrentPolygon([]);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPolygon([]);
  };

  const editLabel = (index) => {
    setOriginalLabelBackup(JSON.parse(JSON.stringify(labels[index])));
    setEditingLabelIndex(index);
    setIsDrawing(false);
  };

  const finishEditing = () => {
    setEditingLabelIndex(-1);
  };

  const cancelEditing = () => {
    if (editingLabelIndex !== -1 && originalLabelBackup) {
      const updated = [...labels];
      updated[editingLabelIndex] = originalLabelBackup;
      setLabels(updated);
    }
    setEditingLabelIndex(-1);
    setOriginalLabelBackup(null);
  };

  const deleteLabel = (index) => {
    if (window.confirm('確定要刪除這個標記嗎？')) {
      const updated = [...labels];
      updated.splice(index, 1);
      setLabels(updated);
    }
  };

  const handleCanvasClick = (point, autoFinish = false) => {
    if (autoFinish) {
      finishDrawing();
      return;
    }

    if (isDrawing) {
      setCurrentPolygon(prev => [...prev, point]);
    } else if (editingLabelIndex !== -1) {
      const updated = [...labels];
      updated[editingLabelIndex].points.push(point);
      setLabels(updated);
    }
  };

  return {
    labels,
    setLabels,
    isDrawing,
    setIsDrawing,
    currentPolygon,
    setCurrentPolygon,
    editingLabelIndex,
    addLabel,
    finishDrawing,
    cancelDrawing,
    editLabel,
    finishEditing,
    cancelEditing,
    deleteLabel,
    handleCanvasClick,
  };
};
