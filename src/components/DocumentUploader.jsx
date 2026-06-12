export default function DocumentUploader({ status, error, onFileSelected, onInstall }) {
  function handleChange(event) {
    onFileSelected(event.target.files?.[0]);
    event.target.value = '';
  }

  return (
    <section className="panel" id="uploadPanel">
      <div className="upload-zone">
        <div className="seal-icon">☙</div>
        <h2>Cargue su documento</h2>
        <p>Tome una foto, seleccione una imagen, cargue un PDF o agregue un DOCX para firmar y sellar.</p>

        <div className="upload-buttons">
          <label className="btn btn-accent" htmlFor="cameraInput">
            Tomar foto
          </label>
          <input type="file" id="cameraInput" accept="image/*" capture="environment" onChange={handleChange} />

          <label className="btn btn-outline" htmlFor="fileInput">
            Subir archivo
          </label>
          <input
            type="file"
            id="fileInput"
            accept="image/*,.pdf,.doc,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleChange}
          />

          {onInstall && (
            <button className="btn btn-gold" type="button" onClick={onInstall}>
              Instalar PWA
            </button>
          )}
        </div>

        {status && <div className="status-line">{status}</div>}
        {error && <div className="status-line error">{error}</div>}
      </div>
    </section>
  );
}
