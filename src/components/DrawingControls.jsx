// src/components/DrawingControls.jsx
import React from 'react';

const DrawingControls = ({ 
  isDrawing, 
  editingLabelIndex, 
  onFinishDrawing, 
  onFinishEditing,
  onCancelDrawing,
  onCancelEditing
}) => {
  if (!isDrawing && editingLabelIndex === -1) {
    return null;
  }

  return (
    <div className="drawing-controls">
      {isDrawing && (
        <>
          <p>標記模式: 點擊圖像添加頂點</p>
          <div className="button-group">
            <button 
              onClick={onFinishDrawing} 
              className="finish-button"
            >
              完成
            </button>
            <button 
              onClick={onCancelDrawing} 
              className="cancel-button"
            >
              取消
            </button>
          </div>
        </>
      )}
      
      {editingLabelIndex !== -1 && (
        <>
          <p>編輯標記 #{editingLabelIndex + 1}</p>
          <div className="button-group">
            <button 
              onClick={onFinishEditing} 
              className="finish-button"
            >
              完成
            </button>
            <button 
              onClick={onCancelEditing} 
              className="cancel-button"
            >
              取消
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DrawingControls;