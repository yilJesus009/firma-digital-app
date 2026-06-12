import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import mammoth from 'mammoth/mammoth.browser';
import { canvasToDocument, readBlobAsDataUrl, renderTextToDocumentImage } from './canvasUtils.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

export function readAsDataUrl(file) {
  return readBlobAsDataUrl(file);
}

function extensionOf(file) {
  return file.name.split('.').pop()?.toLowerCase() || '';
}

async function loadImageDocument(file) {
  const dataUrl = await readBlobAsDataUrl(file);
  const image = new Image();
  image.src = dataUrl;
  await image.decode();

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: file.name,
    sourceType: 'image',
    pageCount: 1,
    dataUrl,
    width: image.naturalWidth,
    height: image.naturalHeight
  };
}

async function loadPdfDocument(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;
  return canvasToDocument(canvas, file.name, 'pdf', pdf.numPages);
}

async function loadDocxDocument(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return renderTextToDocumentImage({
    title: file.name,
    text: result.value,
    sourceType: 'doc'
  });
}

async function loadTextDocument(file) {
  const text = await file.text();
  return renderTextToDocumentImage({
    title: file.name,
    text,
    sourceType: 'text'
  });
}

export async function loadDocumentFile(file) {
  const ext = extensionOf(file);

  if (file.type.startsWith('image/')) return loadImageDocument(file);
  if (file.type === 'application/pdf' || ext === 'pdf') return loadPdfDocument(file);
  if (ext === 'docx') return loadDocxDocument(file);
  if (ext === 'txt') return loadTextDocument(file);

  if (ext === 'doc') {
    throw new Error('Los archivos .doc antiguos no se pueden renderizar de forma confiable en navegador. Conviértalo a PDF o DOCX y vuelva a cargarlo.');
  }

  throw new Error('Formato no compatible. Use imagen, PDF, DOCX o TXT.');
}
