import { useRef } from 'react';

export default function Toolbar({
  signMode,
  isExporting,
  onAddStamp,
  onAddCustomStamp,
  onToggleSign,
  onClearSignature,
  onNewDocument
}) {
  const stampInputRef = useRef(null);

  function handleStampFile(event) {
    onAddCustomStamp(event.target.files?.[0]);
    event.target.value = '';
  }

  return (
    <div className="toolbar">
      <div className="toolbar-label">Herramientas</div>
      <div className="toolbar-row">
        <button className="btn btn-stamp" type="button" onClick={onAddStamp}>
          Agregar sello
        </button>
        <button className="btn btn-stamp" type="button" onClick={() => stampInputRef.current?.click()}>
          Sello del dispositivo
        </button>
        <input ref={stampInputRef} type="file" accept="image/*" onChange={handleStampFile} />

        <button className="btn btn-stamp" type="button" onClick={onToggleSign}>
          {signMode ? 'Desactivar firma' : 'Firmar'}
        </button>
        <button className="btn btn-outline" type="button" onClick={onClearSignature}>
          Borrar firma
        </button>
        <button className="btn btn-outline" type="button" disabled={isExporting} onClick={onNewDocument}>
          Nuevo documento
        </button>
      </div>
    </div>
  );
}
