import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Required for pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

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

export default function PdfImagePreview({ url, width = 192, height = 192 }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const render = async () => {
      try {
        setError(null);
        const pdfUrl = getGoogleDriveProxyUrl(url);
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Scale to fit
        const scale = Math.min(width / viewport.width, height / viewport.height);
        const scaledViewport = page.getViewport({ scale });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
      } catch (err) {
        setError('Failed to load PDF preview.');
      }
    };
    render();
  }, [url, width, height]);

  if (error) {
    return (
      <div className="relative" style={{ width, height }}>
        <div className="absolute inset-0 flex items-center justify-center bg-[#2a2a2a] rounded">
          <span className="text-[#ff6b6b] text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width, height, borderRadius: 8, background: '#2a2a2a', objectFit: 'contain', display: 'block', margin: '0 auto' }}
    />
  );
}
