import { useCallback, useState } from 'react';

function clampZoom(value) {
  return Math.min(Math.max(value, 60), 180);
}

export function useZoom() {
  const [zoom, setZoomState] = useState(100);

  const setZoom = useCallback(value => {
    setZoomState(clampZoom(value));
  }, []);

  const zoomIn = useCallback(() => {
    setZoomState(current => clampZoom(current + 10));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomState(current => clampZoom(current - 10));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomState(100);
  }, []);

  return { zoom, setZoom, zoomIn, zoomOut, resetZoom };
}
