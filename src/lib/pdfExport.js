import { jsPDF } from 'jspdf';
import { buildDefaultStampSvg, loadImage, svgToDataUrl } from './canvasUtils.js';

async function stampSource(stamp) {
  if (stamp.kind === 'image') return stamp.src;
  return svgToDataUrl(buildDefaultStampSvg(stamp.id, stamp.createdAt));
}

export async function exportSignedPdf({ documentFile, signCanvas, stamps }) {
  const baseImage = await loadImage(documentFile.dataUrl);
  const naturalW = documentFile.width || baseImage.naturalWidth;
  const naturalH = documentFile.height || baseImage.naturalHeight;

  const flatCanvas = document.createElement('canvas');
  flatCanvas.width = naturalW;
  flatCanvas.height = naturalH;
  const context = flatCanvas.getContext('2d');

  context.drawImage(baseImage, 0, 0, naturalW, naturalH);

  for (const stamp of stamps) {
    const source = await stampSource(stamp);
    const stampImage = await loadImage(source);
    const x = (stamp.xPct / 100) * naturalW;
    const y = (stamp.yPct / 100) * naturalH;
    const width = (stamp.sizePct / 100) * naturalW;
    const height = width * (stampImage.naturalHeight / stampImage.naturalWidth || 1);

    context.drawImage(stampImage, x, y, width, height);
  }

  context.drawImage(signCanvas, 0, 0, signCanvas.width, signCanvas.height, 0, 0, naturalW, naturalH);

  const imgData = flatCanvas.toDataURL('image/jpeg', 0.92);
  const orientation = naturalW > naturalH ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [naturalW, naturalH]
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, naturalW, naturalH);

  if (documentFile.sourceType === 'pdf' && documentFile.pageCount > 1) {
    pdf.setFontSize(16);
    pdf.setTextColor(120);
    pdf.text(`Nota: se firmó la primera página de ${documentFile.pageCount}.`, 24, naturalH - 24);
  }

  pdf.save('documento-firmado.pdf');
}
