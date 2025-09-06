/**
 * Utility functions for handling media files (images and videos)
 */

/**
 * Check if a file URL is a video based on its extension
 */
export const isVideoFile = (url: string): boolean => {
  if (!url) return false;
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
  const urlLower = url.toLowerCase();
  
  return videoExtensions.some(ext => urlLower.includes(ext));
};

/**
 * Check if a file URL is an image based on its extension
 */
export const isImageFile = (url: string): boolean => {
  if (!url) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const urlLower = url.toLowerCase();
  
  return imageExtensions.some(ext => urlLower.includes(ext));
};

/**
 * Generate a video thumbnail from the first frame
 */
export const generateVideoThumbnail = (videoUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    // Configure video element
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.autoplay = false;
    video.controls = false;
    // Try to set crossOrigin to handle CORS properly
    try {
      video.crossOrigin = 'anonymous';
    } catch (e) {
      // If crossOrigin fails, continue without it
      console.log('CrossOrigin não suportado, continuando sem CORS');
    }
    
    let thumbnailCaptured = false;
    let attempts = 0;
    const maxAttempts = 3;
    
    const cleanup = () => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.pause();
      video.src = '';
    };
    
    const captureFrameSimple = () => {
      if (thumbnailCaptured) return;
      
      try {
        // Ensure video has valid dimensions
        if (!video.videoWidth || !video.videoHeight) {
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(() => captureFrameSimple(), 300);
            return;
          } else {
            throw new Error('Video has no valid dimensions');
          }
        }
        
        // Set canvas dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        thumbnailCaptured = true;
        
        // Try to get canvas data, if CORS fails, use a different approach
        try {
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          cleanup();
          resolve(thumbnailDataUrl);
        } catch (corsError) {
          // CORS error - use canvas.toBlob as alternative
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              cleanup();
              resolve(url);
            } else {
              // If all else fails, return the video URL itself
              cleanup();
              resolve(videoUrl);
            }
          }, 'image/jpeg', 0.9);
        }
        
      } catch (error) {
        if (attempts < maxAttempts) {
          attempts++;
          // Try different seek times
          const seekTimes = [1.0, 2.0, 0.1];
          if (attempts <= seekTimes.length) {
            video.currentTime = seekTimes[attempts - 1];
            setTimeout(() => captureFrameSimple(), 500);
            return;
          }
        }
        cleanup();
        reject(error);
      }
    };
    
    const onLoadedData = () => {
      // Video has loaded data - try to seek to first meaningful frame
      if (video.duration && video.duration > 0) {
        video.currentTime = Math.min(1.0, video.duration * 0.1);
      } else {
        video.currentTime = 1.0;
      }
    };
    
    const onCanPlay = () => {
      if (!thumbnailCaptured) {
        setTimeout(() => captureFrameSimple(), 200);
      }
    };
    
    const onSeeked = () => {
      if (!thumbnailCaptured) {
        setTimeout(() => captureFrameSimple(), 200);
      }
    };
    
    const onTimeUpdate = () => {
      if (video.currentTime > 0 && !thumbnailCaptured) {
        captureFrameSimple();
      }
    };
    
    const onError = (e: any) => {
      cleanup();
      reject(new Error(`Error loading video: ${e.message || 'Unknown error'}`));
    };
    
    // Add event listeners
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('error', onError);
    
    // Set timeout to avoid hanging
    setTimeout(() => {
      if (!thumbnailCaptured) {
        cleanup();
        reject(new Error('Video thumbnail generation timeout'));
      }
    }, 10000);
    
    video.src = videoUrl;
    video.load();
  });
};

/**
 * Get media type and appropriate preview
 */
export const getMediaInfo = async (url: string) => {
  if (!url) {
    return { type: 'none', previewUrl: null, originalUrl: url };
  }
  
  if (isVideoFile(url)) {
    try {
      const thumbnail = await generateVideoThumbnail(url);
      return { type: 'video', previewUrl: thumbnail, originalUrl: url };
    } catch (error) {
      console.warn('Could not generate video thumbnail:', error);
      return { type: 'video', previewUrl: null, originalUrl: url };
    }
  }
  
  if (isImageFile(url)) {
    return { type: 'image', previewUrl: url, originalUrl: url };
  }
  
  return { type: 'unknown', previewUrl: null, originalUrl: url };
};