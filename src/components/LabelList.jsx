// src/components/LabelList.jsx
import React from 'react';

const LabelList = ({ 
  labels, 
  editingLabelIndex, 
  isDrawing, 
  onEditLabel, 
  onDeleteLabel 
}) => {
  return (
    <div className="label-list">
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>Label List</h3>
      {labels.length === 0 ? (
        // 當沒有標籤時，顯示模擬標籤，類似於圖片一的樣式
        !isDrawing && editingLabelIndex === -1 && (
          <div>
            <div className="label-item">
              <span style={{ marginRight: '5px' }}>•</span>
              <span className="label-text">label 1</span>
              <div className="label-actions">
                <button className="edit-button">✎</button>
                <button className="delete-button">🗑</button>
              </div>
            </div>
            <div className="label-item">
              <span style={{ marginRight: '5px' }}>•</span>
              <span className="label-text">label 2</span>
              <div className="label-actions">
                <button className="edit-button">✎</button>
                <button className="delete-button">🗑</button>
              </div>
            </div>
            <div className="label-item">
              <span style={{ marginRight: '5px' }}>•</span>
              <span className="label-text">label 3</span>
              <div className="label-actions">
                <button className="edit-button">✎</button>
                <button className="delete-button">🗑</button>
              </div>
            </div>
            <div className="label-item">
              <span style={{ marginRight: '5px' }}>•</span>
              <span className="label-text">label 4</span>
              <div className="label-actions">
                <button className="edit-button">✎</button>
                <button className="delete-button">🗑</button>
              </div>
            </div>
          </div>
        )
      ) : (
        // 如果有標籤，則顯示實際標籤
        labels.map((label, index) => (
          <div 
            key={label.id} 
            className={`label-item ${editingLabelIndex === index ? 'editing' : ''}`}
          >
            <span style={{ marginRight: '5px' }}>•</span>
            <span className="label-text">
              label {index + 1}
            </span>
            {editingLabelIndex !== index && !isDrawing && (
              <div className="label-actions">
                <button 
                  className="edit-button"
                  onClick={() => onEditLabel(index)}
                  title="編輯標記"
                >
                  ✎
                </button>
                <button 
                  className="delete-button"
                  onClick={() => onDeleteLabel(index)}
                  title="刪除標記"
                >
                  🗑
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default LabelList;