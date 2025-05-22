// 負責根據像素與窗寬窗位產生圖像
export const createDicomImage = async (dicomData) => {
  const {
    dataSet,
    pixelDataElement,
    rows,
    columns,
    bitsAllocated,
    pixelRepresentation,
    windowCenter,
    windowWidth,
    photometricInterpretation,
    rescaleSlope = 1,
    rescaleIntercept = 0
  } = dicomData;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = columns;
  canvas.height = rows;
  const imageData = ctx.createImageData(columns, rows);

  let pixelData;
  if (bitsAllocated === 16) {
    pixelData = pixelRepresentation === 0
      ? new Uint16Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length / 2)
      : new Int16Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length / 2);
  } else {
    pixelData = new Uint8Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);
  }

  const invert = photometricInterpretation === 'MONOCHROME1';
  const windowLow = windowCenter - 0.5 * windowWidth;
  const windowHigh = windowCenter + 0.5 * windowWidth;

  let pixelIndex = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const raw = pixelData[pixelIndex];
      const val = raw * rescaleSlope + rescaleIntercept;
      let adjusted;
      if (val <= windowLow) adjusted = 0;
      else if (val > windowHigh) adjusted = 255;
      else adjusted = Math.round(255 * (val - windowLow) / windowWidth);
      if (invert) adjusted = 255 - adjusted;
      const idx = (y * columns + x) * 4;
      imageData.data[idx] = adjusted;
      imageData.data[idx + 1] = adjusted;
      imageData.data[idx + 2] = adjusted;
      imageData.data[idx + 3] = 255;
      pixelIndex++;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('圖像生成失敗'));
    img.src = canvas.toDataURL();
  });
};
