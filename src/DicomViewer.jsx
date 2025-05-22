// src/DicomViewer.jsx (更新布局，將標記工具並列在病患資訊旁)
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
  const [dicomData, setDicomData] = useState(null);
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
  const [originalLabelBackup, setOriginalLabelBackup] = useState(null);


  // 處理檔案上傳完成
  const handleDicomLoaded = (file, imageObj, patientData, originalDicomData) => {
    console.log("DICOM loaded:", file.name, "Image size:", imageObj.width, "x", imageObj.height);
    setDicomFile(file);
    setDicomImage(imageObj);
    setPatientInfo(patientData);
    setDicomData(originalDicomData);

    // 清除現有標記
    setLabels([]);
    setCurrentPolygon([]);
    setIsDrawing(false);
    setEditingLabelIndex(-1);
  };

  // 處理影像更新（如窗寬/窗位變化後）
  const handleImageUpdate = (newImage, newDicomData) => {
    setDicomImage(newImage);
    setDicomData(newDicomData);
  };

  // 添加新標記
  const addLabel = () => {
    if (dicomFile) {
      setIsDrawing(true);
      setCurrentPolygon([]);
      setEditingLabelIndex(-1);
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
    } else {
      alert('多邊形需要至少3個點。已取消繪製。');
    }

    setIsDrawing(false);
    setCurrentPolygon([]);
  };

  // 取消繪製
  const cancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPolygon([]);
  };

  // 編輯標記
  const editLabel = (index) => {
    setOriginalLabelBackup(JSON.parse(JSON.stringify(labels[index]))); // 深拷貝
    setEditingLabelIndex(index);
    setIsDrawing(false);
  };


  // 完成編輯
  const finishEditing = () => {
    setEditingLabelIndex(-1);
  };

  // 取消編輯
  const cancelEditing = () => {
    if (editingLabelIndex !== -1 && originalLabelBackup) {
      const updated = [...labels];
      updated[editingLabelIndex] = originalLabelBackup; // 還原
      setLabels(updated);
    }
    setEditingLabelIndex(-1);
    setOriginalLabelBackup(null); // 清除備份
  };


  // 刪除標記
  const deleteLabel = (index) => {
    if (window.confirm('確定要刪除這個標記嗎？')) {
      const updatedLabels = [...labels];
      updatedLabels.splice(index, 1);
      setLabels(updatedLabels);
    }
  };

  // 處理畫布點擊
  const handleCanvasClick = (point, autoFinish = false) => {
    if (autoFinish) {
      finishDrawing();
      return;
    }

    if (isDrawing) {
      setCurrentPolygon([...currentPolygon, point]);
    } else if (editingLabelIndex !== -1) {
      const updatedLabels = [...labels];
      updatedLabels[editingLabelIndex].points.push(point);
      setLabels(updatedLabels);
    }
  };


  return (
    <div className="app">
      {/* 標題欄 */}
      <Header title="DICOM Viewer" />

      <div className="main-content">
        <div className="left-panel">
          {/* 上傳按鈕、病患信息和繪製控制在同一行 */}
          <div className="info-and-controls-row">
            <div className="patient-section">
              <DicomUploader onDicomLoaded={handleDicomLoaded} />
              <PatientInfo data={patientInfo} />
            </div>

            {/* 繪製控制放在這裡，在病患資訊旁邊 */}
            {(isDrawing || editingLabelIndex !== -1) && (
              <div className="drawing-controls-wrapper">
                <DrawingControls
                  isDrawing={isDrawing}
                  editingLabelIndex={editingLabelIndex}
                  onFinishDrawing={finishDrawing}
                  onFinishEditing={finishEditing}
                  onCancelDrawing={cancelDrawing}
                  onCancelEditing={cancelEditing}
                />
              </div>
            )}
          </div>

          {/* 圖像顯示 */}
          <DicomCanvas
            dicomFile={dicomFile}
            dicomImage={dicomImage}
            dicomData={dicomData}
            labels={labels}
            setLabels={setLabels}
            currentPolygon={currentPolygon}
            editingLabelIndex={editingLabelIndex}
            isDrawing={isDrawing}
            onClick={handleCanvasClick}
            onImageUpdate={handleImageUpdate}
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
    </div>
  );
};

export default DicomViewer;