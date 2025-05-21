// src/components/LabelList.jsx
import React from 'react';

const LabelList = ({ labels, editingLabelIndex, isDrawing, onEditLabel, onDeleteLabel }) => {
  return (
    <div className="labels-panel">
      <h2>Label List</h2>
      {labels.length > 0 ? (
        <ul className="label-list">
          {labels.map((label, index) => (
            <li key={label.id} className="label-item">
              <div className="label-name">
                <div className="label-indicator"></div>
                <span>label {index + 1}</span>
              </div>
              <div className="button-group">
                <button
                  className="edit-button"
                  onClick={() => onEditLabel(index)}
                  disabled={isDrawing || editingLabelIndex !== -1}
                >
                  <span className="icon">✎</span>
                </button>
                <button
                  className="delete-button"
                  onClick={() => onDeleteLabel(index)}
                  disabled={isDrawing || editingLabelIndex !== -1}
                >
                  <span className="icon">🗑</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No labels yet</p>
      )}
    </div>
  );
};

export default LabelList;