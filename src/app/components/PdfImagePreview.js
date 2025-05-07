"use client";

import { useMemo } from 'react';

export default function PdfImagePreview({ url, width = 300, height = 400 }) {
  // Google Drive proxy logic to handle PDF URL
  const getGoogleDriveFileId = useMemo(() => {
    return (url) => {
      let match = url.match(/\/file\/d\/([^/]+)/);
      if (match) return match[1];
      match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match) return match[1];
      return null;
    };
  }, []);

  const getProxiedPdfUrl = useMemo(() => {
    return (url) => {
      const fileId = getGoogleDriveFileId(url);
      if (fileId) {
        return `/api/proxy-pdf?fileId=${fileId}`;
      }
      return url;
    };
  }, [getGoogleDriveFileId]);

  const pdfUrl = useMemo(() => {
    return getProxiedPdfUrl(url);
  }, [url, getProxiedPdfUrl]);

  if (!url) {
    return <div className="text-red-500 text-xs">No PDF URL provided</div>;
  }

  // Standard preview size
  const frameWidth = 160;
  const frameHeight = 220;

  return (
    <div
      style={{
        width: frameWidth,
        height: frameHeight,
        overflow: 'hidden',
        borderRadius: 8,
        background: '#2a2a2a',
        position: 'relative',
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <iframe
        key={pdfUrl} // Add key to force remount only when URL changes
        src={pdfUrl}
        width={frameWidth}
        height={frameHeight}
        style={{
          border: 0,
          borderRadius: 8,
          background: '#2a2a2a',
          width: frameWidth,
          height: frameHeight,
          overflow: 'hidden',
          pointerEvents: 'none', // Prevents interaction/scroll
          transform: 'scale(0.9)', // Downscale content to fit nicely
          transformOrigin: 'top left',
          display: 'block',
        }}
        aria-label="PDF preview"
        loading="lazy"
        title="PDF preview"
        tabIndex={-1}
      />
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
        }

        iframe::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
    </div>
  );
}
