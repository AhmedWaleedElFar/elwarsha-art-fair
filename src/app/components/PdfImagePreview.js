"use client";

export default function PdfImagePreview({ url, width = 300, height = 400 }) {
  // Google Drive proxy logic to handle PDF URL
  function getGoogleDriveFileId(url) {
    let match = url.match(/\/file\/d\/([^/]+)/);
    if (match) return match[1];
    match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
    return null;
  }
  function getProxiedPdfUrl(url) {
    const fileId = getGoogleDriveFileId(url);
    if (fileId) {
      return `/api/proxy-pdf?fileId=${fileId}`;
    }
    return url;
  }
  if (!url) {
    return <div className="text-red-500 text-xs">No PDF URL provided</div>;
  }
  // Standard preview size
  const frameWidth = 160;
  const frameHeight = 220;
  const pdfUrl = getProxiedPdfUrl(url);
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
      {/* Hide scrollbars in iframe (for most browsers) */}
      <style>{`
        iframe::-webkit-scrollbar { display: none !important; }
        iframe { scrollbar-width: none !important; }
      `}</style>
    </div>
  );
}
