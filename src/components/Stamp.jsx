import { buildDefaultStampSvg } from '../lib/canvasUtils.js';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function Stamp({ stamp, stageRef, disabled, onMove, onRemove }) {
  function handlePointerDown(event) {
    if (disabled || event.button > 0) return;
    event.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const stampEl = event.currentTarget;
    const stageRect = stage.getBoundingClientRect();
    const stampRect = stampEl.getBoundingClientRect();
    const offsetX = event.clientX - stampRect.left;
    const offsetY = event.clientY - stampRect.top;

    stampEl.setPointerCapture?.(event.pointerId);
    stampEl.classList.add('dragging');

    function handlePointerMove(moveEvent) {
      const nextX = ((moveEvent.clientX - stageRect.left - offsetX) / stageRect.width) * 100;
      const nextY = ((moveEvent.clientY - stageRect.top - offsetY) / stageRect.height) * 100;
      const heightPct = (stampRect.height / stageRect.height) * 100;

      onMove(stamp.id, {
        xPct: clamp(nextX, 0, 100 - stamp.sizePct),
        yPct: clamp(nextY, 0, 100 - heightPct)
      });
    }

    function handlePointerUp(upEvent) {
      stampEl.releasePointerCapture?.(upEvent.pointerId);
      stampEl.classList.remove('dragging');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }

  return (
    <div
      className={`stamp ${stamp.kind === 'image' ? 'stamp-image' : ''}`}
      style={{
        left: `${stamp.xPct}%`,
        top: `${stamp.yPct}%`,
        width: `${stamp.sizePct}%`,
        pointerEvents: disabled ? 'none' : 'auto'
      }}
      onPointerDown={handlePointerDown}
      role="button"
      tabIndex={0}
      aria-label={stamp.kind === 'image' ? `Sello ${stamp.name || 'personalizado'}` : 'Sello Notario Express'}
    >
      {stamp.kind === 'image' ? (
        <img src={stamp.src} alt={stamp.name || 'Sello personalizado'} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: buildDefaultStampSvg(stamp.id, stamp.createdAt) }} />
      )}

      <button
        className="remove-stamp"
        type="button"
        aria-label="Quitar sello"
        onPointerDown={event => event.stopPropagation()}
        onClick={event => {
          event.stopPropagation();
          onRemove(stamp.id);
        }}
      >
        ×
      </button>
    </div>
  );
}
