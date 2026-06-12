export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset, onChange }) {
  return (
    <div className="zoom-controls">
      <span className="toolbar-label inline-label">Zoom</span>
      <button className="zoom-btn" type="button" title="Alejar" onClick={onZoomOut}>
        −
      </button>
      <input
        className="zoom-range"
        type="range"
        min="60"
        max="180"
        step="10"
        value={zoom}
        aria-label="Zoom del documento"
        onChange={event => onChange(Number(event.target.value))}
      />
      <button className="zoom-btn" type="button" title="Acercar" onClick={onZoomIn}>
        +
      </button>
      <button className="zoom-reset" type="button" onClick={onReset}>
        {zoom}%
      </button>
    </div>
  );
}
