"use client";

import { memo, useEffect } from 'react';

export default memo(function PdfImagePreview({ url, width = 190, height = 520, cachePreview }) {
  useEffect(() => {
    if (cachePreview) {
      const preview = (
        <PdfImagePreview url={url} width={width} height={height} />
      );
      cachePreview(url, preview);
    }
  }, [url, cachePreview, width, height]);

  // Extract Google Drive file ID from different link formats
  function getGoogleDriveFileId(link) {
    let match = link.match(/\/file\/d\/([^/]+)/);
    if (!match) match = link.match(/\/uc\?id=([^&]+)/);
    if (!match) match = link.match(/\/open\?id=([^&]+)/);
    return match ? match[1] : null;
  }

  // Build proxied or direct preview URL
  function getProxiedPdfUrl(pdfUrl) {
    if (!pdfUrl) return '';
    
    // Handle Google Drive links
    if (pdfUrl.includes('drive.google.com')) {
      const fileId = getGoogleDriveFileId(pdfUrl);
      if (fileId) return `https://drive.google.com/uc?export=view&id=${fileId}`;
      return pdfUrl;
    }
    
    // Handle direct PDF links
    if (pdfUrl.toLowerCase().endsWith('.pdf')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    }
    
    return pdfUrl;
  }

  if (!url) {
    return (
      <div className="text-red-500 text-xs font-mono">
        No PDF URL provided
      </div>
    );
  }

  const previewUrl = getProxiedPdfUrl(url);

  return (
    <div
      className="relative flex items-center justify-center rounded-md shadow-md bg-zinc-800"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <iframe
        src={previewUrl}
        width={width}
        height={height}
        loading="lazy"
        aria-label="PDF preview"
        title="PDF preview"
        tabIndex={-1}
        style={{
          border: "none",
          borderRadius: 8,
          overflow: "hidden",
          background: "#2a2a2a",
          position: "relative"
        }}
        scrolling="no"
      >
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            transform: "scale(1)",
            transformOrigin: "center",
            maxWidth: "100%",
            maxHeight: "100%"
          }}>
            {/* The PDF content will be centered here */}
          </div>
        </div>
      </iframe>

      {/* Overlay div to cover scrollbar area */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '20px', // Approximate scrollbar width
          height: '100%',
          zIndex: 10,
          background: '#27272a', // bg-zinc-800 Tailwind color (#27272a)
          borderTopRightRadius: '8px',
          borderBottomRightRadius: '8px',
        }}
      />

      {/* Global styles to hide scrollbars across browsers */}
      <style jsx global>{`
        /* Hide scrollbars for Chrome, Safari and Opera */
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* Hide scrollbars for IE, Edge and Firefox */
        * {
          -ms-overflow-style: none !important;  /* IE and Edge */
          scrollbar-width: none !important;     /* Firefox */
        }

        iframe {
          overflow: hidden !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        iframe::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
    </div>
  );
});
