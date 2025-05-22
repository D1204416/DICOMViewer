// src/components/DicomUploader.jsx
import React, { useRef, useState } from 'react';
import { parseDicomFile } from '../utils/dicomMetadataParser';
import { createDicomImage } from '../utils/dicomImageRenderer';
import { calculateAge, formatDate } from '../utils/dateUtils';

const DicomUploader = ({ onDicomLoaded }) => {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // 處理檔案上傳
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      
      try {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            console.log("Starting DICOM parsing...");
            const arrayBuffer = e.target.result;
            const dicomData = parseDicomFile(arrayBuffer);
            
            // 從出生日期計算年齡
            const birthdate = dicomData.patientData.birthdate;
            const calculatedAge = calculateAge(birthdate);
            
            // 格式化出生日期為易讀形式
            const formattedBirthdate = formatDate(birthdate);
            
            // 更新患者資訊
            const patientData = {
              patientName: dicomData.patientData.patientName,
              patientId: dicomData.patientData.patientId,
              birthdate: formattedBirthdate,
              birthTime: dicomData.patientData.birthTime,
              age: calculatedAge,
              sex: dicomData.patientData.sex,
              bodyPartExamined: dicomData.patientData.bodyPartExamined,
              patientPosition: dicomData.patientData.patientPosition,
            };
            
            console.log("Creating DICOM image...");
            const imageObj = await createDicomImage(dicomData);
            
            console.log("DICOM processing complete, image size:", imageObj.width, "x", imageObj.height);
            onDicomLoaded(file, imageObj, patientData, dicomData);
          } catch (error) {
            console.error('Error processing DICOM file:', error);
            alert('處理DICOM檔案時發生錯誤: ' + error.message);
          } finally {
            setIsLoading(false);
          }
        };
        
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
          alert('讀取檔案時發生錯誤');
          setIsLoading(false);
        };
        
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Error handling file upload:', error);
        alert('上傳檔案時發生錯誤');
        setIsLoading(false);
      }
    }
  };

  // 觸發文件選擇對話框
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="dicom-uploader">
      <button 
        onClick={triggerFileInput} 
        className="upload-button"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Upload'}
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".dcm" 
        className="hidden" 
      />
      {isLoading && <div className="loading-indicator">處理DICOM中...</div>}
    </div>
  );
};

export default DicomUploader;