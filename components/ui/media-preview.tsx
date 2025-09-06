"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Image as ImageIcon, Video, AlertCircle } from 'lucide-react';
import { VideoThumbnailFallback } from './video-thumbnail-fallback';
import { getMediaInfo, isVideoFile } from '@/lib/media-utils';

interface MediaPreviewProps {
  url: string | null;
  alt?: string;
  className?: string;
  onClick?: () => void;
  showPlayIcon?: boolean;
}

export function MediaPreview({ 
  url, 
  alt = "Preview", 
  className = "", 
  onClick,
  showPlayIcon = true 
}: MediaPreviewProps) {
  const [mediaInfo, setMediaInfo] = useState<{
    type: string;
    previewUrl: string | null;
    originalUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnailError, setThumbnailError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    const loadMediaInfo = async () => {
      try {
        setIsLoading(true);
        setThumbnailError(false);
        const info = await getMediaInfo(url);
        setMediaInfo(info);
      } catch (error) {
        console.error('Error loading media info:', error);
        setMediaInfo({ type: 'error', previewUrl: null, originalUrl: url });
      } finally {
        setIsLoading(false);
      }
    };

    loadMediaInfo();
  }, [url]);

  if (!url) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className}`}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!mediaInfo || mediaInfo.type === 'error') {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className}`}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }

  const isVideo = mediaInfo.type === 'video';
  const previewSrc = mediaInfo.previewUrl || url;

  // Se é vídeo mas não tem thumbnail, tentar gerar um manualmente
  if (isVideo && !mediaInfo.previewUrl && !thumbnailError) {
    return (
      <VideoThumbnailFallback 
        url={url} 
        className={className} 
        onClick={onClick}
        onError={() => setThumbnailError(true)}
      />
    );
  }

  return (
    <div 
      className={`relative overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      onClick={onClick}
    >
      {thumbnailError && isVideo ? (
        // Fallback para vídeos quando há erro na imagem
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white bg-opacity-90 rounded-full p-3 mx-auto mb-2">
              <Play className="h-6 w-6 text-gray-700 ml-0.5" fill="currentColor" />
            </div>
            <div className="bg-black bg-opacity-70 rounded px-2 py-1">
              <svg className="h-3 w-3 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <img 
          src={previewSrc} 
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (isVideo) {
              setThumbnailError(true);
            }
          }}
        />
      )}
      
      {isVideo && showPlayIcon && !thumbnailError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white bg-opacity-90 rounded-full p-2">
            <Play className="h-4 w-4 text-gray-700 ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );
}