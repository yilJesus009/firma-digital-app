import Stamp from './Stamp.jsx';
import SignaturePad from './SignaturePad.jsx';

export default function DocumentCanvas({
  documentFile,
  stageRef,
  signCanvasRef,
  signMode,
  stamps,
  zoom,
  onImageLoad,
  onStampMove,
  onStampRemove
}) {
  return (
    <div className="stage-scroll">
      <div className="doc-stage" ref={stageRef} style={{ width: `${zoom}%` }}>
        <img className="doc-img" src={documentFile.dataUrl} alt={documentFile.name} onLoad={onImageLoad} />
        <SignaturePad canvasRef={signCanvasRef} active={signMode} />

        {stamps.map(stamp => (
          <Stamp
            key={stamp.id}
            stamp={stamp}
            stageRef={stageRef}
            disabled={signMode}
            onMove={onStampMove}
            onRemove={onStampRemove}
          />
        ))}

        {signMode && <div className="mode-badge sign-mode">Modo firma activo</div>}
      </div>
    </div>
  );
}
