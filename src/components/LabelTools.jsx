// src/components/LabelTools.jsx
import React from 'react';

const LabelTools = ({ onAddLabel, disabled }) => {
  return (
    <div className="label-tools">
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>Label Tools</h3>
      <button 
        onClick={onAddLabel}
        disabled={disabled}
        className="add-button"
      >
        Add
      </button>
    </div>
  );
};

export default LabelTools;