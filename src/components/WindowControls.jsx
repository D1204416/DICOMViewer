// src/components/WindowControls.jsx
import React, { useState, useEffect } from 'react';

const WindowControls = ({ 
  dicomFile, 
  initialWindowCenter = 127, 
  initialWindowWidth = 256, 
  onWindowChange 
}) => {
  const [windowCenter, setWindowCenter] = useState(initialWindowCenter);
  const [windowWidth, setWindowWidth] = useState(initialWindowWidth);
  const [isOpen, setIsOpen] = useState(false);
  
  // 當初始值變化時更新狀態
  useEffect(() => {
    if (dicomFile) {
      setWindowCenter(initialWindowCenter);
      setWindowWidth(initialWindowWidth);
    }
  }, [dicomFile, initialWindowCenter, initialWindowWidth]);
  
  // 窗口中心值變化處理
  const handleCenterChange = (e) => {
    const newCenter = parseInt(e.target.value);
    setWindowCenter(newCenter);
    onWindowChange(newCenter, windowWidth);
  };
  
  // 窗口寬度變化處理
  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value);
    setWindowWidth(newWidth);
    onWindowChange(windowCenter, newWidth);
  };
  
  // 預設窗口設置
  const applyPreset = (preset) => {
    let newCenter, newWidth;
    
    switch(preset) {
      case 'brain':
        newCenter = 40;
        newWidth = 80;
        break;
      case 'lung':
        newCenter = -600;
        newWidth = 1500;
        break;
      case 'abdomen':
        newCenter = 50;
        newWidth = 350;
        break;
      case 'bone':
        newCenter = 480;
        newWidth = 2500;
        break;
      case 'invert':
        // 僅反轉黑白
        onWindowChange(windowCenter, windowWidth, true);
        return;
      default:
        // 重設到原始值
        newCenter = initialWindowCenter;
        newWidth = initialWindowWidth;
    }
    
    setWindowCenter(newCenter);
    setWindowWidth(newWidth);
    onWindowChange(newCenter, newWidth);
  };
  
  if (!dicomFile) return null;
  
  return (
    <div className="window-controls">
      <button 
        className="window-button" 
        onClick={() => setIsOpen(!isOpen)}
        title="窗寬/窗位調整"
      >
        窗位/窗寬
      </button>
      
      {isOpen && (
        <div className="window-panel">
          <div className="window-sliders">
            <div className="slider-group">
              <label>窗位: {windowCenter}</label>
              <input
                type="range"
                min="-1024"
                max="3071"
                value={windowCenter}
                onChange={handleCenterChange}
              />
            </div>
            <div className="slider-group">
              <label>窗寬: {windowWidth}</label>
              <input
                type="range"
                min="1"
                max="4095"
                value={windowWidth}
                onChange={handleWidthChange}
              />
            </div>
          </div>
          
          <div className="window-presets">
            <button onClick={() => applyPreset('default')}>重設</button>
            <button onClick={() => applyPreset('brain')}>腦</button>
            <button onClick={() => applyPreset('lung')}>肺</button>
            <button onClick={() => applyPreset('abdomen')}>腹部</button>
            <button onClick={() => applyPreset('bone')}>骨頭</button>
            <button onClick={() => applyPreset('invert')}>黑白反轉</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WindowControls;