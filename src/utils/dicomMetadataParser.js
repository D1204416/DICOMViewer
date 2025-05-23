// 負責解析病患與影像基本資訊

import * as dicomParser from 'dicom-parser';

const safeGetString = (dataSet, tag, defaultValue = 'Unknown') => {
  try {
    const value = dataSet.string(tag);
    return value !== undefined && value !== null && value !== '' ? value : defaultValue;
  } catch {
    return defaultValue;
  }
};


const safeGetNumber = (dataSet, tag, defaultValue = 0) => {
  try {
    const value = dataSet.floatString(tag);
    return value !== undefined ? value : defaultValue;
  } catch {
    return defaultValue;
  }
};

const safeGetUint16 = (dataSet, tag, defaultValue = 0) => {
  try {
    const value = dataSet.uint16(tag);
    return value !== undefined ? value : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const parseDicomFile = (arrayBuffer) => {
  const byteArray = new Uint8Array(arrayBuffer);
  const dataSet = dicomParser.parseDicom(byteArray);

  let birthdate = safeGetString(dataSet, 'x00100030', 'Unknown');
  let age = safeGetString(dataSet, 'x00101010', 'Unknown');

  const today = new Date();
  if (birthdate === 'Unknown' && age !== 'Unknown') {
    const match = age.match(/^(\d+)([DWMY])$/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      let birthYear = today.getFullYear();
      if (unit === 'Y') birthYear -= value;
      else if (unit === 'M') birthYear -= Math.floor(value / 12);
      else if (unit === 'W') birthYear -= Math.floor(value / 52);
      else if (unit === 'D') birthYear -= Math.floor(value / 365);
      birthdate = `${birthYear}0101`;
    }
  }

  const patientData = {
    patientName: safeGetString(dataSet, 'x00100010', 'Unknown'),
    patientId: safeGetString(dataSet, 'x00100020', 'Unknown'),
    birthdate,
    birthTime: safeGetString(dataSet, 'x00100032', 'Unknown'),
    age,
    sex: safeGetString(dataSet, 'x00100040', 'Unknown'),
    height: safeGetString(dataSet, 'x00101020', 'Unknown'),
    weight: safeGetString(dataSet, 'x00101030', 'Unknown'),
    
    studyDate: safeGetString(dataSet, 'x00080020', 'Unknown'),
    bodyPartExamined: safeGetString(dataSet, 'x00180015', 'Unknown'),
    patientPosition: safeGetString(dataSet, 'x00185100', 'Unknown'),

  };


  const pixelDataElement = dataSet.elements.x7fe00010;
  if (!pixelDataElement) throw new Error('無法找到像素數據');

  const rescaleType = safeGetString(dataSet, 'x00281054', '');
  let windowCenter = safeGetNumber(dataSet, 'x00281050', 127);
  let windowWidth = safeGetNumber(dataSet, 'x00281051', 256);

  if (Array.isArray(windowCenter)) windowCenter = windowCenter[0];
  if (Array.isArray(windowWidth)) windowWidth = windowWidth[0];

  const isHU = rescaleType === 'HU';
  if (isHU && windowWidth <= 0) {
    windowCenter = 40;
    windowWidth = 400;
  } else if (windowWidth <= 0) {
    windowCenter = 127;
    windowWidth = 256;
  }

  return {
    dataSet,
    pixelDataElement,
    rows: safeGetUint16(dataSet, 'x00280010', 512),
    columns: safeGetUint16(dataSet, 'x00280011', 512),
    bitsAllocated: safeGetUint16(dataSet, 'x00280100', 8),
    bitsStored: safeGetUint16(dataSet, 'x00280101', 8),
    highBit: safeGetUint16(dataSet, 'x00280102', 7),
    pixelRepresentation: safeGetUint16(dataSet, 'x00280103', 0),
    samplesPerPixel: safeGetUint16(dataSet, 'x00280002', 1),
    planarConfiguration: safeGetUint16(dataSet, 'x00280006', 0),
    photometricInterpretation: safeGetString(dataSet, 'x00280004', 'MONOCHROME2'),
    windowCenter,
    windowWidth,
    rescaleSlope: safeGetNumber(dataSet, 'x00281053', 1),
    rescaleIntercept: safeGetNumber(dataSet, 'x00281052', 0),
    rescaleType,
    transferSyntaxUID: safeGetString(dataSet, 'x00020010', '1.2.840.10008.1.2'),
    patientData
  };
};
