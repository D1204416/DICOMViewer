// src/components/PatientInfo.jsx
import React from 'react';

const PatientInfo = ({ data }) => {
  return (
    <div className="patient-info">
      <p><strong>Patient Name:</strong> {data.patientName}</p>
      <p><strong>Birthdate:</strong> {data.birthdate}</p>
      <p><strong>Age:</strong> {data.age}</p>
      <p><strong>Sex:</strong> {data.sex}</p>
    </div>
  );
};

export default PatientInfo;