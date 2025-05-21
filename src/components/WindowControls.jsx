// src/components/WindowControls.jsx
import React, { useState, useEffect } from 'react';
import { getPresetWindows } from '../utils/dicomHelper';

const WindowControls = ({ 
  dicomFile, 
  initialWindowCenter = 127, 
  initialWindowWidth = 256, 
  onWindowChange 
}) => {
  const [windowCenter, setWindowCenter] = useState(initialWindowCenter);
  const [windowWidth, setWindowWidth] = useState(initialWindowWidth);
  const [isOpen, setIsOpen] = useState(false);
  
  // 獲取預設窗口設置
  const presetWindows = getPresetWindows();
  
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
        newCenter = presetWindows['腦'].center;
        newWidth = presetWindows['腦'].width;
        break;
      case 'lung':
        newCenter = presetWindows['肺'].center;
        newWidth = presetWindows['肺'].width;
        break;
      case 'softTissue':
        newCenter = presetWindows['腹部'].center;
        newWidth = presetWindows['腹部'].width;
        break;
      case 'mediastinum':
        newCenter = presetWindows['縱隔'].center;
        newWidth = presetWindows['縱隔'].width;
        break;
      case 'bone':
        newCenter = presetWindows['骨頭'].center;
        newWidth = presetWindows['骨頭'].width;
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
  
  // 計算滑動條最大最小值 (基於HU值範圍)
  const getSliderRange = () => {
    // CT影像的HU值典型範圍是-1024到3071
    return {
      centerMin: -1024,
      centerMax: 3071,
      widthMin: 1,
      widthMax: 4095
    };
  };
  
  const sliderRange = getSliderRange();
  
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
                min={sliderRange.centerMin}
                max={sliderRange.centerMax}
                value={windowCenter}
                onChange={handleCenterChange}
              />
            </div>
            <div className="slider-group">
              <label>窗寬: {windowWidth}</label>
              <input
                type="range"
                min={sliderRange.widthMin}
                max={sliderRange.widthMax}
                value={windowWidth}
                onChange={handleWidthChange}
              />
            </div>
          </div>
          
          <div className="window-presets">
            <button onClick={() => applyPreset('default')}>重設</button>
            <button onClick={() => applyPreset('brain')}>腦</button>
            <button onClick={() => applyPreset('lung')}>肺</button>
            <button onClick={() => applyPreset('softTissue')}>軟組織</button>
            <button onClick={() => applyPreset('mediastinum')}>縱隔</button>
            <button onClick={() => applyPreset('bone')}>骨頭</button>
            <button onClick={() => applyPreset('invert')}>黑白反轉</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WindowControls;