import React from 'react';

const CanvasToolbar = ({
  setScale,
  setOffset,
  handleWindowChange
}) => {
  return (
    <div className="navigation-controls">
      <div className="tooltip-container">
        <button onClick={() => setScale(prev => Math.min(prev * 1.1, 10))} title="放大 (+)">+</button>
        <button onClick={() => setScale(prev => Math.max(prev * 0.9, 0.1))} title="縮小 (-)">-</button>
        <button
          onClick={() => {
            setScale(1);
            setOffset({ x: 0, y: 0 });
          }}
          title="重置 (0)"
        >↺</button>
        <button onClick={() => handleWindowChange(null, null, true)} title="反轉 (i)">◐</button>
      </div>
    </div>
  );
};

export default CanvasToolbar;
