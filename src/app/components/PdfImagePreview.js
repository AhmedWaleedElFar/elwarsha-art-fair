import { useEffect, useRef, useState } from 'react';

export default function PdfImagePreview({ url, width = 300, height = 400 }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let pdfjsLib;
    let loadingTask;
    let destroyed = false;

    async function renderPDF() {
      try {
        pdfjsLib = await import('pdfjs-dist/build/pdf');
        if (typeof window !== 'undefined') {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        }
        // Always use proxy for Google Drive
        function getGoogleDriveFileId(url) {
          let match = url.match(/\/file\/d\/([^/]+)/);
          if (match) return match[1];
          match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
          if (match) return match[1];
          return null;
        }
        function getGoogleDriveProxyUrl(url) {
          const fileId = getGoogleDriveFileId(url);
          if (fileId) {
            return `/api/proxy-pdf?fileId=${fileId}`;
          }
          return url;
        }
        const pdfUrl = getGoogleDriveProxyUrl(url);
        loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = canvasRef.current;
        if (!canvas || destroyed) return;
        // Calculate scale to fit the box while preserving aspect ratio
        const scale = Math.min((width || viewport.width) / viewport.width, (height || viewport.height) / viewport.height);
        const scaledViewport = page.getViewport({ scale });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
      } catch (err) {
        setError('Failed to render PDF');
      }
    }

    renderPDF();

    return () => {
      destroyed = true;
      if (loadingTask && loadingTask.destroy) loadingTask.destroy();
    };
  }, [url, width, height]);

  if (error) return <div className="text-red-500 text-xs">{error}</div>;
  return <canvas ref={canvasRef} style={{ width, height, maxWidth: '100%', borderRadius: 8, background: '#2a2a2a' }} />;
}
