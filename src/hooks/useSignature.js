import { useCallback, useEffect, useRef } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

const [hasSignature, setHasSignature] = useState(false);

const clearSignature = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  setHasSignature(false);
}, [canvasRef]);

function getEventPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const point = event.touches ? event.touches[0] : event;
  return {
    x: point.clientX - rect.left,
    y: point.clientY - rect.top
  };
}

export function useSignature(canvasRef, stageRef, isActive) {
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const snapshot = document.createElement('canvas');
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;

    if (canvas.width && canvas.height) {
      snapshot.getContext('2d').drawImage(canvas, 0, 0);
    }

    canvas.width = Math.round(rect.width);
    canvas.height = Math.round(rect.height);

    if (snapshot.width && snapshot.height) {
      canvas
        .getContext('2d')
        .drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, canvas.width, canvas.height);
    }
  }, [canvasRef, stageRef]);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function startDraw(event) {
      if (!isActive) return;
      event.preventDefault();
      drawingRef.current = true;
      lastPointRef.current = getEventPoint(event, canvas);
    }

    function moveDraw(event) {
      if (!isActive || !drawingRef.current) return;
      event.preventDefault();

      const point = getEventPoint(event, canvas);
      const context = canvas.getContext('2d');
      context.strokeStyle = '#1a2e22';
      context.lineWidth = 2.5;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.beginPath();
      context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      context.lineTo(point.x, point.y);
      context.stroke();
      lastPointRef.current = point;
      setHasSignature(true);
      lastPointRef.current = point;
    }

    function endDraw() {
      drawingRef.current = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', moveDraw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', moveDraw, { passive: false });
    canvas.addEventListener('touchend', endDraw);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', moveDraw);
      canvas.removeEventListener('mouseup', endDraw);
      canvas.removeEventListener('mouseleave', endDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', moveDraw);
      canvas.removeEventListener('touchend', endDraw);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [canvasRef, isActive, resizeCanvas]);

  return { clearSignature, resizeCanvas, hasSignature };
}
