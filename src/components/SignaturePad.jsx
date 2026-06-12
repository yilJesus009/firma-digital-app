export default function SignaturePad({ canvasRef, active }) {
  return <canvas ref={canvasRef} className={`sign-canvas ${active ? '' : 'inactive'}`} />;
}
