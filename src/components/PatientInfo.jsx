// src/components/PatientInfo.jsx
import React from 'react';

const PatientInfo = ({ data }) => {
  return (
    <div className="patient-info">
      <div className="info-row">
        <span className="info-label">Patient Name:</span>
        <span className="info-value">{data.patientName}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Birthdate:</span>
        <span className="info-value">{data.birthdate}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Age:</span>
        <span className="info-value">{data.age}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Sex:</span>
        <span className="info-value">{data.sex}</span>
      </div>
    </div>
  );
};

export default PatientInfo;