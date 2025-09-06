'use client';

import { useState, useEffect } from 'react';
import { Play, Video } from 'lucide-react';
import { generateVideoThumbnail } from '@/lib/media-utils';

interface VideoThumbnailFallbackProps {
  url: string;
  className?: string;
  onClick?: () => void;
  onError?: () => void;
}

export function VideoThumbnailFallback({ 
  url, 
  className = '', 
  onClick, 
  onError 
}: VideoThumbnailFallbackProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const thumbnailUrl = await generateVideoThumbnail(url);
        setThumbnail(thumbnailUrl);
      } catch (error) {
        console.error('Erro ao gerar thumbnail do vídeo:', error);
        // Para vídeos com CORS, vamos tentar mostrar o próprio vídeo como preview
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('cross-origin') || errorMessage.includes('tainted') || errorMessage.includes('SecurityError')) {
          console.log('Usando vídeo como preview devido a restrições CORS');
          setThumbnail(url); // Usa o próprio URL do vídeo
        } else {
          setHasError(true);
          onError?.();
        }
      } finally {
        setIsLoading(false);
      }
    };

    generateThumbnail();
  }, [url, onError]);

  if (hasError) {
    return (
      <div 
        className={`relative overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-900 flex items-center justify-center ${className}`}
        onClick={onClick}
      >
        <div className="flex flex-col items-center justify-center text-white">
          <Video className="h-8 w-8 mb-2" />
          <span className="text-xs">Vídeo</span>
        </div>
        
        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 rounded-full p-2">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
        </div>
        
        {/* Video badge */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          Vídeo
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div 
        className={`relative overflow-hidden cursor-pointer bg-gray-200 flex items-center justify-center ${className}`}
        onClick={onClick}
      >
        <div className="flex flex-col items-center justify-center text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
          <span className="text-xs mt-2">Carregando...</span>
        </div>
      </div>
    );
  }

  // Se o thumbnail é o próprio URL do vídeo (fallback para CORS), usar elemento video
  const isVideoFallback = thumbnail === url;

  return (
    <div 
      className={`relative overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      onClick={onClick}
    >
      {isVideoFallback ? (
        <video
          src={url}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
          onLoadedData={(e) => {
            // Seek to 1 second to show a meaningful frame
            const video = e.target as HTMLVideoElement;
            if (video.duration > 1) {
              video.currentTime = 1;
            }
          }}
          onError={() => {
            setHasError(true);
            onError?.();
          }}
        />
      ) : (
        <img
          src={thumbnail || ''}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
          onError={() => {
            setHasError(true);
            onError?.();
          }}
        />
      )}
      
      {/* Play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black bg-opacity-50 rounded-full p-2">
          <Play className="h-6 w-6 text-white fill-white" />
        </div>
      </div>
      
      {/* Video badge */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        Vídeo
      </div>
    </div>
  );
}
