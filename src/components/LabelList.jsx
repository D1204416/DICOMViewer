// src/components/LabelList.jsx
import React from 'react';

const LabelList = ({ 
  labels = [], 
  editingLabelIndex = -1, 
  isDrawing = false, 
  onEditLabel, 
  onDeleteLabel 
}) => {
  return (
    <div className="labels-panel">
      <h2>Label List</h2>
      <ul className="label-list">
        {labels.map((label, index) => (
          <li key={label.id} className="label-item">
            <span className="label-name">• label {index + 1}</span>
            <div className="button-group">
              <button 
                onClick={() => onEditLabel(index)}
                disabled={isDrawing || editingLabelIndex !== -1}
                className="edit-button"
              >
                <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button 
                onClick={() => onDeleteLabel(index)}
                disabled={isDrawing || editingLabelIndex !== -1}
                className="delete-button"
              >
                <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LabelList;