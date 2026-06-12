# Notario Express PWA

Aplicación PWA para cargar documentos desde el dispositivo, tomar fotos, agregar sellos, subir sellos personalizados, firmar sobre el documento y exportar el resultado como PDF.

## Uso

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173`.

Para generar la versión final:

```bash
npm run build
npm run preview
```

## Soporte de archivos

- Imágenes: se cargan directamente.
- PDF: se renderiza la primera página para firmarla y sellarla.
- DOCX: se genera una vista previa básica basada en texto extraído.
- DOC antiguo: conviértalo primero a PDF o DOCX para evitar una renderización incorrecta en navegador.

Todo el procesamiento ocurre localmente en el navegador.
