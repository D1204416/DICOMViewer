import React, { useState } from 'react';
import Header from './components/Header';
import DicomUploader from './components/DicomUploader';
import PatientInfo from './components/PatientInfo';
import DicomCanvas from './components/DicomCanvas';
import LabelTools from './components/LabelTools';
import LabelList from './components/LabelList';
import DrawingControls from './components/DrawingControls';
import { useDicomEditor } from './hooks/useDicomEditor';

const DicomViewer = () => {
  const [dicomFile, setDicomFile] = useState(null);
  const [dicomImage, setDicomImage] = useState(null);
  const [dicomData, setDicomData] = useState(null);
  const [patientInfo, setPatientInfo] = useState({
    patientName: 'xxxx',
    birthdate: 'xxxx',
    age: 'xx',
    sex: 'x',
    patientId: 'xxxx',
    birthTime: 'xxxxxx',
    bodyPartExamined: 'xx',
    patientPosition: 'xxx',
  });

  const {
    labels,
    setLabels,
    isDrawing,
    currentPolygon,
    editingLabelIndex,
    addLabel,
    finishDrawing,
    cancelDrawing,
    editLabel,
    finishEditing,
    cancelEditing,
    deleteLabel,
    handleCanvasClick,
  } = useDicomEditor();

  const handleDicomLoaded = (file, imageObj, patientData, originalDicomData) => {
    setDicomFile(file);
    setDicomImage(imageObj);
    setPatientInfo(patientData);
    setDicomData(originalDicomData);
    setLabels([]);
    cancelDrawing();
    cancelEditing();
  };

  const handleImageUpdate = (newImage, newDicomData) => {
    setDicomImage(newImage);
    setDicomData(newDicomData);
  };

  return (
    <div className="app">
      <Header title="DICOM Viewer" />
      <div className="main-content">
        <div className="left-panel">
          <div className="info-and-controls-row">
            <div className="patient-section">
              <DicomUploader onDicomLoaded={handleDicomLoaded} />
              <PatientInfo data={patientInfo} />
            </div>
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
          <LabelTools
            onAddLabel={addLabel}
            disabled={isDrawing || editingLabelIndex !== -1 || !dicomFile}
          />
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