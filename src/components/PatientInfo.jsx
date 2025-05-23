import React from 'react';
import { formatDate } from '../utils/dateUtils';

const PatientInfo = ({ data }) => {
  return (
    <div className="patient-info">

      <div className="info-part info-part1">
        <div className="info-row">
          <span className="info-label">P't Name:</span>
          <span className="info-value">{data.patientName}</span>
        </div>
        <div className="info-row">
          <span className="info-label">P't ID:</span>
          <span className="info-value">{data.patientId}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Birthdate:</span>
          <span className="info-value">{formatDate(data.birthdate)}</span>
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
          <span className="info-label">Height:</span>
          <span className="info-value">
            {data.height && data.height !== 'Unknown'
              ? `${data.height} cm`
              : 'Unknown'}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Weight:</span>
          <span className="info-value">
            {data.weight && data.weight !== 'Unknown'
              ? `${data.weight} cm`
              : 'Unknown'}
          </span>
        </div>
        <div>
          <div className="info-row">
            <span className="info-label">Study Date:</span>
            <span className="info-value">
              {data.studyDate !== 'Unknown' ? formatDate(data.studyDate) : 'Unknown'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Body Part:</span>
            <span className="info-value">{data.bodyPartExamined}</span>
          </div>
          <div className="info-row">
            <span className="info-label">P't Position:</span>
            <span className="info-value">{data.patientPosition}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PatientInfo;
