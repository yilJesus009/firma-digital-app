import { useState } from 'react';
import { loadDocumentFile } from '../lib/scanner.js';

export function useCanvas() {
  const [documentFile, setDocumentFile] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function loadDocument(file) {
    if (!file) return;
    setError('');
    setStatus('Preparando documento...');

    try {
      const loaded = await loadDocumentFile(file);
      setDocumentFile(loaded);
      setStatus('');
    } catch (err) {
      setDocumentFile(null);
      setError(err.message);
      setStatus('');
    }
  }

  function resetDocument() {
    setDocumentFile(null);
    setStatus('');
    setError('');
  }

  return {
    documentFile,
    status,
    error,
    loadDocument,
    resetDocument
  };
}
