import { useEffect, useRef, useState } from 'react';
import DocumentCanvas from './components/DocumentCanvas.jsx';
import DocumentUploader from './components/DocumentUploader.jsx';
import Toolbar from './components/Toolbar.jsx';
import ZoomControls from './components/ZoomControls.jsx';
import { useCanvas } from './hooks/useCanvas.js';
import { useSignature } from './hooks/useSignature.js';
import { useZoom } from './hooks/useZoom.js';
import { readAsDataUrl } from './lib/scanner.js';
import { exportSignedPdf } from './lib/pdfExport.js';

function createId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const stageRef = useRef(null);
  const signCanvasRef = useRef(null);
  const [signMode, setSignMode] = useState(false);
  const [stamps, setStamps] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const { documentFile, status, error, loadDocument, resetDocument } = useCanvas();
  const { zoom, zoomIn, zoomOut, resetZoom, setZoom } = useZoom();
  const { clearSignature, resizeCanvas } = useSignature(signCanvasRef, stageRef, signMode);

  useEffect(() => {
    const onBeforeInstallPrompt = event => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    setSignMode(false);
    setStamps([]);
    clearSignature();
    resetZoom();
  }, [documentFile?.id]);

  useEffect(() => {
    if (!documentFile) return;
    const frame = requestAnimationFrame(resizeCanvas);
    return () => cancelAnimationFrame(frame);
  }, [documentFile, resizeCanvas, zoom]);

  function addStamp(stamp) {
    setSignMode(false);
    setStamps(current => [
      ...current,
      {
        id: createId(),
        kind: 'seal',
        xPct: 42.5,
        yPct: 42.5,
        sizePct: 15,
        createdAt: new Date().toISOString(),
        ...stamp
      }
    ]);
  }

  async function addCustomStamp(file) {
    if (!file) return;
    const src = await readAsDataUrl(file);
    addStamp({
      kind: 'image',
      src,
      name: file.name,
      sizePct: 18
    });
  }

  function updateStamp(id, patch) {
    setStamps(current => current.map(stamp => (stamp.id === id ? { ...stamp, ...patch } : stamp)));
  }

  function removeStamp(id) {
    setStamps(current => current.filter(stamp => stamp.id !== id));
  }

  function newDocument() {
    if (!window.confirm('¿Descartar el documento actual y empezar de nuevo?')) return;
    setStamps([]);
    clearSignature();
    setSignMode(false);
    resetDocument();
  }

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  async function exportPdf() {
    if (!documentFile || !stageRef.current || !signCanvasRef.current) return;
    setIsExporting(true);

    try {
      await exportSignedPdf({
        documentFile,
        stage: stageRef.current,
        signCanvas: signCanvasRef.current,
        stamps
      });
    } catch (err) {
      window.alert(`Ocurrió un error al generar el PDF: ${err.message}`);
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <header>
        <div className="brand">
          <span className="brand-mark">
            Notario<span>Express</span>
          </span>
          <span className="brand-tag">Firma & Sello Digital</span>
        </div>
        <div className="file-no">
          {documentFile ? `EXPEDIENTE N° ${documentFile.id.slice(0, 8).toUpperCase()} · ${documentFile.name}` : 'EXPEDIENTE N° — generado al cargar documento'}
        </div>
      </header>

      <main>
        {!documentFile && (
          <DocumentUploader
            status={status}
            error={error}
            onFileSelected={loadDocument}
            onInstall={installPrompt ? installApp : null}
          />
        )}

        {documentFile && (
          <section className="panel workspace active">
            <Toolbar
              signMode={signMode}
              isExporting={isExporting}
              onAddStamp={() => addStamp()}
              onAddCustomStamp={addCustomStamp}
              onToggleSign={() => setSignMode(active => !active)}
              onClearSignature={clearSignature}
              onNewDocument={newDocument}
            />

            <div className="hint">
              <strong>Sello:</strong> arrástrelo con el dedo o el mouse a la posición deseada, toque la X para quitarlo.
              &nbsp;|&nbsp; <strong>Firma:</strong> active el modo "Firmar" y dibuje directamente sobre el documento.
            </div>

            <ZoomControls zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} onChange={setZoom} />

            <DocumentCanvas
              documentFile={documentFile}
              stageRef={stageRef}
              signCanvasRef={signCanvasRef}
              signMode={signMode}
              stamps={stamps}
              zoom={zoom}
              onImageLoad={resizeCanvas}
              onStampMove={updateStamp}
              onStampRemove={removeStamp}
            />

            <div className="footer-actions">
              <button className="btn btn-gold" disabled={isExporting} onClick={exportPdf}>
                {isExporting ? 'Generando PDF...' : 'Descargar PDF firmado'}
              </button>
            </div>
          </section>
        )}
      </main>

      <footer>Documento procesado localmente · Ningún archivo se envía a servidores</footer>
    </>
  );
}
