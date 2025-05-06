"use client";

import Image from 'next/image';
import { useState } from 'react';

export default function ArtworkImagePreview({ 
  url, 
  width = 300, 
  height = 400, 
  className = '',
  objectFit = 'contain'
}) {
  const [isLoading, setIsLoading] = useState(true);

  function getGoogleDriveFileId(url) {
    let match = url.match(/\/file\/d\/([^/]+)/);
    if (match) return match[1];
    match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
    return null;
  }

  function getProxiedImageUrl(url) {
    const fileId = getGoogleDriveFileId(url);
    if (fileId) {
      return `/api/proxy-image?fileId=${fileId}`;
    }
    return url;
  }

  function isPdfUrl(url) {
    return url && url.toLowerCase().endsWith('.pdf');
  }

  function isImageUrl(url) {
    return /\.(jpe?g|png|gif|webp)$/i.test(url) || url?.startsWith('https://picsum.photos/');
  }

  if (!url) {
    return <div className="text-red-500 text-xs">No artwork URL provided</div>;
  }

  const imageUrl = isPdfUrl(url) || isGoogleDriveLink(url) 
    ? getProxiedImageUrl(url) 
    : url;

  return (
    <div 
      className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg bg-[#2a2a2a] ${className}`}
      style={{ 
        width: width, 
        height: height,
        maxWidth: '100%',
        maxHeight: '100%'
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#2a2a2a] z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
        </div>
      )}
      <Image
        src={imageUrl}
        alt="Artwork"
        fill
        priority
        onLoadingComplete={() => setIsLoading(false)}
        className={`object-${objectFit} rounded-lg`}
        style={{ 
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
}

function isGoogleDriveLink(url) {
  return url && url.includes('drive.google.com');
}
