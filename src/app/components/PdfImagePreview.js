import { useState, useEffect } from 'react';

export default function PdfImagePreview({ url, width = 300, height = 400 }) {
  const [previewSrc, setPreviewSrc] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  // Always use proxy for Google Drive
  function getGoogleDriveFileId(url) {
    console.log('Parsing Google Drive URL:', url);
    
    // Try multiple regex patterns to extract file ID
    const patterns = [
      /\/file\/d\/([^/]+)/,  // /file/d/fileId
      /\/d\/([^/]+)/,         // /d/fileId
      /\?id=([a-zA-Z0-9_-]+)/, // ?id=fileId
      /\/open\?id=([a-zA-Z0-9_-]+)/, // /open?id=fileId
      /\/view\?id=([a-zA-Z0-9_-]+)/, // /view?id=fileId
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const fileId = match[1];
        console.log('Extracted File ID:', fileId);
        return fileId;
      }
    }

    console.log('No file ID found');
    return null;
  }

  function getGoogleDriveProxyUrl(url) {
    try {
      const fileId = getGoogleDriveFileId(url);
      if (!fileId) {
        throw new Error('Invalid Google Drive URL');
      }
      const proxyUrl = `/api/proxy-pdf-preview?fileId=${fileId}&width=${width}&height=${height}`;
      console.log('Generated Proxy URL:', proxyUrl);
      return proxyUrl;
    } catch (err) {
      console.error('Error generating proxy URL:', err);
      setError(`URL Error: ${err.message}`);
      return null;
    }
  }

  useEffect(() => {
    const generatePreview = async () => {
      console.group('PDF Preview Generation');
      console.log('Input Parameters:', { url, width, height });

      try {
        const proxyUrl = getGoogleDriveProxyUrl(url);
        if (!proxyUrl) {
          console.error('Invalid proxy URL generation');
          setError('Could not generate preview URL');
          console.groupEnd();
          return;
        }

        console.log('Proxy URL:', proxyUrl);

        const fetchDebugInfo = {
          url: proxyUrl,
          method: 'GET',
          headers: { 'Accept': 'image/png' }
        };

        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/png',
          }
        });

        const responseDebugInfo = {
          ...fetchDebugInfo,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        };

        console.log('Fetch Response:', responseDebugInfo);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Preview Fetch Error:', {
            ...responseDebugInfo,
            errorBody: errorText
          });
          setError(`Failed to load preview: ${errorText}`);
          setDebugInfo(responseDebugInfo);
          console.groupEnd();
          return;
        }

        const blob = await response.blob();
        const blobDebugInfo = {
          ...responseDebugInfo,
          blobSize: blob.size,
          blobType: blob.type
        };

        console.log('Blob Details:', blobDebugInfo);

        const objectUrl = URL.createObjectURL(blob);
        setPreviewSrc(objectUrl);
        setDebugInfo(blobDebugInfo);
        console.log('Preview Generated:', objectUrl);
      } catch (err) {
        console.error('Preview Generation Error:', {
          message: err.message,
          stack: err.stack
        });
        setError(`Error generating preview: ${err.message}`);
        setDebugInfo({ errorMessage: err.message });
      } finally {
        console.groupEnd();
      }
    };

    generatePreview();

    // Cleanup function
    return () => {
      if (previewSrc) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [url, width, height]);

  if (error) {
    return (
      <div 
        style={{
          width, 
          height, 
          background: '#2a2a2a', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderRadius: 8
        }}
      >
        {error}
      </div>
    );
  }

  if (!previewSrc) {
    return (
      <div 
        style={{
          width, 
          height, 
          background: '#2a2a2a', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderRadius: 8
        }}
      >
        Loading PDF Preview...
      </div>
    );
  }

  return (
    <div
      style={{
        width: width,
        height: height,
        background: '#2a2a2a',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {error ? (
        <div style={{ color: 'red', textAlign: 'center', padding: '10px' }}>
          {error}
        </div>
      ) : previewSrc ? (
        <>
          <img
            key={previewSrc}
            src={previewSrc}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block'
            }}
            alt="PDF Preview"
            onError={(e) => {
              console.error('Image load error:', {
                src: previewSrc,
                error: e.type,
                naturalWidth: e.target.naturalWidth,
                naturalHeight: e.target.naturalHeight
              });
              setError('Failed to load preview image');
            }}
            onLoad={(e) => {
              console.log('Image loaded successfully', {
                src: previewSrc,
                naturalWidth: e.target.naturalWidth,
                naturalHeight: e.target.naturalHeight
              });
            }}
          />
          {process.env.NODE_ENV === 'development' && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '5px',
                fontSize: '10px',
                maxHeight: '100px',
                overflow: 'auto',
                zIndex: 10
              }}
            >
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </>
      ) : (
        <div style={{ color: 'white', textAlign: 'center', padding: '10px' }}>
          Loading Preview...
        </div>
      )}
    </div>
  );
}
