// src/DicomViewer.jsx
import React, { useState } from 'react';
import Header from './components/Header';
import DicomUploader from './components/DicomUploader';
import PatientInfo from './components/PatientInfo';
import DicomCanvas from './components/DicomCanvas';
import LabelTools from './components/LabelTools';
import LabelList from './components/LabelList';
import DrawingControls from './components/DrawingControls';

// 主應用組件
const DicomViewer = () => {
  // 狀態管理
  const [dicomFile, setDicomFile] = useState(null);
  const [dicomImage, setDicomImage] = useState(null);
  const [patientInfo, setPatientInfo] = useState({
    patientName: 'xxxx',
    birthdate: 'xx',
    age: 'xx',
    sex: 'x'
  });
  const [labels, setLabels] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [editingLabelIndex, setEditingLabelIndex] = useState(-1);
  
  // 處理檔案上傳完成
  const handleDicomLoaded = (file, imageObj, patientData) => {
    setDicomFile(file);
    setDicomImage(imageObj);
    setPatientInfo(patientData);
  };
  
  // 添加新標記
  const addLabel = () => {
    if (dicomFile) {
      setIsDrawing(true);
      setCurrentPolygon([]);
    }
  };
  
  // 完成繪製
  const finishDrawing = () => {
    if (currentPolygon.length > 2) {
      const newLabel = {
        id: Date.now(),
        points: [...currentPolygon]
      };
      
      setLabels([...labels, newLabel]);
    }
    
    setIsDrawing(false);
    setCurrentPolygon([]);
  };
  
  // 編輯標記
  const editLabel = (index) => {
    setEditingLabelIndex(index);
  };
  
  // 完成編輯
  const finishEditing = () => {
    setEditingLabelIndex(-1);
  };
  
  // 刪除標記
  const deleteLabel = (index) => {
    const updatedLabels = [...labels];
    updatedLabels.splice(index, 1);
    setLabels(updatedLabels);
  };
  
  // 處理畫布點擊
  const handleCanvasClick = (point) => {
    if (!dicomFile) return;
    
    if (isDrawing) {
      // 繪製新多邊形
      setCurrentPolygon([...currentPolygon, point]);
    } else if (editingLabelIndex !== -1) {
      // 編輯模式
      const updatedLabels = [...labels];
      updatedLabels[editingLabelIndex].points.push(point);
      setLabels(updatedLabels);
    }
  };
  
  return (
    <>
      {/* 標題欄 */}
      <Header title="Site Title" />
      
      <div className="main-content">
        <div className="left-panel">
          {/* 上傳按鈕與病患信息 */}
          <div className="top-controls">
            <DicomUploader onDicomLoaded={handleDicomLoaded} />
            <PatientInfo data={patientInfo} />
          </div>
          
          {/* 圖像顯示 */}
          <DicomCanvas
            dicomFile={dicomFile}
            dicomImage={dicomImage}
            labels={labels}
            currentPolygon={currentPolygon}
            editingLabelIndex={editingLabelIndex}
            onClick={handleCanvasClick}
          />
          
          {/* 繪製控制 */}
          <DrawingControls
            isDrawing={isDrawing}
            editingLabelIndex={editingLabelIndex}
            onFinishDrawing={finishDrawing}
            onFinishEditing={finishEditing}
          />
        </div>
        
        <div className="right-panel">
          {/* 標記工具 */}
          <LabelTools
            onAddLabel={addLabel}
            disabled={isDrawing || editingLabelIndex !== -1 || !dicomFile}
          />
          
          {/* 標記列表 */}
          <LabelList
            labels={labels}
            editingLabelIndex={editingLabelIndex}
            isDrawing={isDrawing}
            onEditLabel={editLabel}
            onDeleteLabel={deleteLabel}
          />
        </div>
      </div>
    </>
  );
};

export default DicomViewer;