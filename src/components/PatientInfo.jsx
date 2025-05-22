// src/components/PatientInfo.jsx
import React from 'react';

const PatientInfo = ({ data }) => {
  return (
    <div className="patient-info">

      <div className="info-part info-part1">
        <div className="info-row">
          <span className="info-label">P't Name:</span>
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
      <div className="info-part info-part2">
        <div className="info-row">
          <span className="info-label">P't ID:</span>
          <span className="info-value">{data.patientId || 'Unknown'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Birth Time:</span>
          <span className="info-value">{data.birthTime || 'Unknown'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Body Part:</span>
          <span className="info-value">{data.bodyPartExamined || 'Unknown'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">P't Position:</span>
          <span className="info-value">{data.patientPosition || 'Unknown'}</span>
        </div>
      </div>

    </div>
  );
};

export default PatientInfo;
