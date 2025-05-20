// src/components/DrawingControls.jsx
import React from 'react';

const DrawingControls = ({ 
  isDrawing, 
  editingLabelIndex, 
  onFinishDrawing, 
  onFinishEditing 
}) => {
  if (!isDrawing && editingLabelIndex === -1) {
    return null;
  }

  return (
    <div className="drawing-controls">
      {isDrawing && (
        <>
          <p>點擊圖像添加多邊形頂點。至少需要3個點。</p>
          <button 
            onClick={onFinishDrawing} 
            className="finish-button"
          >
            完成繪製
          </button>
        </>
      )}
      
      {editingLabelIndex !== -1 && (
        <>
          <p>編輯標記 #{editingLabelIndex + 1}. 點擊圖像添加更多頂點。</p>
          <button 
            onClick={onFinishEditing} 
            className="finish-button"
          >
            完成編輯
          </button>
        </>
      )}
    </div>
  );
};

export default DrawingControls;