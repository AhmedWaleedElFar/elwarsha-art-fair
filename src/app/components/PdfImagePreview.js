import { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react';
import('pdfjs-dist/build/pdf.worker.entry');

export default function PdfImagePreview({ url, width = 300, height = 400 }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false);
  

  // Ref callback to detect when canvas is mounted
  const setCanvas = useCallback(node => {
    canvasRef.current = node;
    if (node) setCanvasReady(true);
  }, []);

  useLayoutEffect(() => {
    if (!canvasReady) return;
    let destroyed = false;
    let loadingTask;
    let pdfjsLib;

    async function renderPDF() {
      setLoading(true);
      setError('');
      try {
        if (typeof window === 'undefined') return;
        pdfjsLib = await import('pdfjs-dist/build/pdf');
        await import('pdfjs-dist/build/pdf.worker.entry');
        // Google Drive proxy logic
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
        //console.log('[PDF Preview] workerSrc:', workerSrc);
        console.log('[PDF Preview] pdfUrl:', pdfUrl);
        loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        console.log('[PDF Preview] PDF loaded successfully');
        const page = await pdf.getPage(1);
        console.log('[PDF Preview] Page 1 loaded successfully');
        const viewport = page.getViewport({ scale: 1 });
        // Wait for canvas to be present
        let tries = 0;
        function waitForCanvasAndRender() {
          const canvas = canvasRef.current;
          if (!canvas || destroyed) {
            tries++;
            if (tries < 10 && !destroyed) {
              console.log('[PDF Preview] Canvas not ready, retrying...', tries);
              setTimeout(waitForCanvasAndRender, 50);
            } else {
              console.warn('[PDF Preview] Canvas still missing after retries, aborting');
              setError('Canvas not available for PDF rendering');
              setLoading(false);
            }
            return;
          }
          // Scale to fit box
          const scale = Math.min((width || viewport.width) / viewport.width, (height || viewport.height) / viewport.height);
          const scaledViewport = page.getViewport({ scale });
          // Ensure integer dimensions
          canvas.width = Math.floor(scaledViewport.width);
          canvas.height = Math.floor(scaledViewport.height);
          canvas.style.width = `${Math.floor(width)}px`;
          canvas.style.height = `${Math.floor(height)}px`;

          const context = canvas.getContext('2d');
          console.log('[PDF Preview] Canvas actual size:', canvas.width, canvas.height);
          if (!context) {
            console.error('[PDF Preview] Canvas context is null!');
            setError('Canvas context is null');
            setLoading(false);
            return;
          }
          page.render({ canvasContext: context, viewport: scaledViewport }).promise.then(() => {
            console.log('[PDF Preview] Page rendered to canvas');
            if (!destroyed) setLoading(false);
          }).catch(err => {
            console.error('[PDF Preview] Render error:', err);
            setError('Failed to render PDF: ' + (err && err.message ? err.message : String(err)));
            setLoading(false);
          });
        }
        waitForCanvasAndRender();
      } catch (err) {
        if (!destroyed) setError('Failed to render PDF: ' + (err && err.message ? err.message : String(err)));
        setLoading(false);
      }
    }

    // Only run on client
    if (typeof window !== 'undefined') {
      renderPDF();
    }

    return () => {
      destroyed = true;
      if (loadingTask && loadingTask.destroy) loadingTask.destroy();
    };
  }, [url, width, height, canvasReady]);

  if (error) return <div className="text-red-500 text-xs" style={{whiteSpace:'pre-wrap'}}>{error}</div>;
  return (
    <canvas
      ref={setCanvas}
      style={{ width, height, maxWidth: '100%', borderRadius: 8, background: '#2a2a2a' }}
      aria-label="PDF preview"
    />
  );
}


