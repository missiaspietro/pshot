"use client";

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { isVideoFile } from '@/lib/media-utils';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string | null;
  alt?: string;
}

export function MediaModal({ isOpen, onClose, mediaUrl, alt = "Media" }: MediaModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Pause video when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen || !mediaUrl) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const isVideo = isVideoFile(mediaUrl);

  return (
    <div 
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
    >
      <div className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-1.5 text-gray-700 shadow-lg transition-colors hover:bg-gray-100"
          aria-label="Fechar"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        
        {isVideo ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            controls
            autoPlay
            muted
            playsInline
            className="max-h-[85vh] max-w-full rounded-lg shadow-2xl"
            style={{ maxWidth: '100%', maxHeight: '85vh' }}
            onError={(e) => {
              console.error('Erro ao carregar vídeo:', e);
            }}
            onLoadStart={() => {
              console.log('Iniciando carregamento do vídeo');
            }}
            onLoadedData={() => {
              console.log('Vídeo carregado com sucesso');
            }}
          >
            <source src={mediaUrl} type="video/mp4" />
            <source src={mediaUrl} type="video/webm" />
            <source src={mediaUrl} type="video/ogg" />
            Seu navegador não suporta o elemento de vídeo.
          </video>
        ) : (
          <img
            src={mediaUrl}
            alt={alt}
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            onError={(e) => {
              console.error('Erro ao carregar imagem:', e);
            }}
          />
        )}
      </div>
    </div>
  );
}