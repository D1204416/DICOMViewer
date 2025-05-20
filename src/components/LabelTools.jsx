// src/components/LabelTools.jsx
import React from 'react';

const LabelTools = ({ onAddLabel, disabled }) => {
  return (
    <div className="tools-panel">
      <h2>Label Tools</h2>
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