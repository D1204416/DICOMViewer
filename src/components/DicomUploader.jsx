// src/components/DicomUploader.jsx
import React, { useRef } from 'react';
import { parseDicomFile, createDicomImage } from '../utils/dicomHelper';

const DicomUploader = ({ onDicomLoaded }) => {
  const fileInputRef = useRef(null);

  // 觸發文件選擇對話框
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // 處理檔案上傳
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          const {
            dataSet,
            pixelDataElement,
            rows,
            columns,
            windowCenter,
            windowWidth,
            patientData
          } = parseDicomFile(arrayBuffer);
          
          // 生成圖像並傳遞回上層
          const imageObj = createDicomImage(
            dataSet, 
            pixelDataElement, 
            rows, 
            columns, 
            windowCenter, 
            windowWidth
          );
          
          onDicomLoaded(file, imageObj, patientData);
        } catch (error) {
          console.error('Error parsing DICOM file:', error);
          alert('無法解析DICOM檔案，請確保檔案格式正確。');
        }
      };
      
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <button 
        onClick={triggerFileInput} 
        className="upload-button"
      >
        Upload
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".dcm" 
        className="hidden" 
      />
    </div>
  );
};

export default DicomUploader;