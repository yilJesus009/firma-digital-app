export function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function canvasToDocument(canvas, name, sourceType, pageCount = 1) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    sourceType,
    pageCount,
    dataUrl: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height
  };
}

export function buildDefaultStampSvg(id = 'stamp', createdAt = new Date().toISOString()) {
  const pathId = `circlePath-${String(id).replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const date = new Date(createdAt).toLocaleDateString('es-BO');

  return `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="none" stroke="#a3372e" stroke-width="4"/>
      <circle cx="60" cy="60" r="46" fill="none" stroke="#a3372e" stroke-width="1.5" stroke-dasharray="2 3"/>
      <path id="${pathId}" d="M 60,14 A 46,46 0 1 1 59.9,14" fill="none"/>
      <text font-family="Georgia, serif" font-size="11" font-weight="700" fill="#a3372e" letter-spacing="2">
        <textPath href="#${pathId}" startOffset="2%">NOTARIO EXPRESS · VERIFICADO</textPath>
      </text>
      <text x="60" y="55" text-anchor="middle" font-family="Georgia, serif" font-size="16" font-weight="700" fill="#a3372e">CONFORME</text>
      <text x="60" y="74" text-anchor="middle" font-family="Courier New, monospace" font-size="9" fill="#a3372e">${date}</text>
      <path d="M30,90 q15,-10 30,0 q15,10 30,0" fill="none" stroke="#a3372e" stroke-width="2"/>
    </svg>
  `;
}

export function svgToDataUrl(svgMarkup) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
}

function wrapText(context, text, maxWidth) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let line = '';

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }

  if (line) lines.push(line);
  return lines;
}

export function renderTextToDocumentImage({ title, text, sourceType }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;
  const context = canvas.getContext('2d');

  context.fillStyle = '#fffdf8';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = '#d9cfb8';
  context.lineWidth = 2;
  for (let y = 150; y < canvas.height - 120; y += 42) {
    context.beginPath();
    context.moveTo(96, y);
    context.lineTo(canvas.width - 96, y);
    context.stroke();
  }

  context.fillStyle = '#1a2e22';
  context.font = '700 42px Georgia, serif';
  context.fillText(title || 'Documento', 96, 92);

  context.font = '22px Courier New, monospace';
  context.fillStyle = '#8a8070';
  context.fillText(sourceType === 'doc' ? 'Vista previa básica de documento Word' : 'Vista previa de texto', 96, 126);

  context.font = '28px Courier New, monospace';
  context.fillStyle = '#1a2e22';

  const paragraphs = (text || 'El documento no contiene texto legible.').split(/\n{2,}/);
  let y = 196;

  for (const paragraph of paragraphs) {
    const lines = wrapText(context, paragraph, canvas.width - 192);
    for (const line of lines) {
      if (y > canvas.height - 120) break;
      context.fillText(line, 96, y);
      y += 42;
    }
    y += 24;
    if (y > canvas.height - 120) break;
  }

  return canvasToDocument(canvas, title || 'documento', sourceType);
}
