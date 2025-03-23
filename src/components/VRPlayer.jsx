import React, { useEffect, useRef, useState } from 'react';
import 'aframe';
import { Spinner, Alert } from 'react-bootstrap';

const VRPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    if (!videoUrl) {
      setLoadError('No video URL provided.');
      setIsLoading(false);
      return;
    }
    
    let mounted = true;
    const videoElement = videoRef.current;
    
    if (videoElement) {
      // Reset state when changing videos
      setIsLoading(true);
      setLoadError(null);
      setLoadingProgress(0);
      
      const checkResourceAvailability = async () => {
        try {
          // Check if the video resource is available by making a HEAD request
          const response = await fetch(videoUrl, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`Video resource unavailable: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error('Error checking video availability:', error);
          if (mounted) {
            setLoadError(`Failed to load video. Please check the URL and try again. Error: ${error.message}`);
            setIsLoading(false);
          }
          return false;
        }
        return true;
      };
      
      const setupVideoListeners = () => {
        // Simulate loading progress
        let progressInterval = setInterval(() => {
          if (mounted) {
            setLoadingProgress(prev => {
              const newProgress = prev + (Math.random() * 5);
              return newProgress > 90 ? 90 : newProgress;
            });
          }
        }, 500);
        
        // Video loaded successfully
        videoElement.addEventListener('canplay', () => {
          if (mounted) {
            clearInterval(progressInterval);
            setLoadingProgress(100);
            setIsLoading(false);
          }
        });
        
        // Error loading video
        videoElement.addEventListener('error', (e) => {
          if (mounted) {
            clearInterval(progressInterval);
            console.error('Video load error:', e);
            
            let errorMessage = 'Failed to load video.';
            
            // Try to get more specific error details from the MediaError
            if (videoElement.error) {
              switch (videoElement.error.code) {
                case 1: // MEDIA_ERR_ABORTED
                  errorMessage = 'Video loading was aborted.';
                  break;
                case 2: // MEDIA_ERR_NETWORK
                  errorMessage = 'Network error occurred while loading the video.';
                  break;
                case 3: // MEDIA_ERR_DECODE
                  errorMessage = 'Video decoding failed. The file may be corrupted.';
                  break;
                case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
                  errorMessage = 'Video format is not supported by your browser.';
                  break;
                default:
                  errorMessage = `Error loading video: ${videoElement.error.message || 'Unknown error'}`;
              }
            }
            
            setLoadError(errorMessage);
            setIsLoading(false);
            
            // If this is a net::ERR_FAILED, provide more helpful error message
            if (videoElement.error && videoElement.error.message && 
                videoElement.error.message.includes('net::ERR_FAILED')) {
              setLoadError('Failed to load the video resource. This may be due to network issues or the resource may be unavailable.');
            }
          }
        });
        
        return progressInterval;
      };
      
      // First check if resource is available, then setup video
      checkResourceAvailability().then(isAvailable => {
        if (isAvailable && mounted) {
          const progressInterval = setupVideoListeners();
          return () => {
            clearInterval(progressInterval);
            mounted = false;
          };
        }
      });
    }
    
    return () => {
      mounted = false;
    };
  }, [videoUrl]);
  
  return (
    <div className="vr-player" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div className="loading-overlay d-flex flex-column justify-content-center align-items-center" 
             style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10 }}>
          <Spinner animation="border" variant="light" className="mb-3" />
          <p className="text-white mb-2">Loading VR Video...</p>
          <div className="progress w-75" style={{ height: '10px' }}>
            <div className="progress-bar" role="progressbar" style={{ width: `${loadingProgress}%` }} />
          </div>
        </div>
      )}
      
      {loadError && (
        <div className="error-overlay d-flex justify-content-center align-items-center" 
             style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10 }}>
          <Alert variant="danger" className="mx-3">
            <Alert.Heading>Video Error</Alert.Heading>
            <p>{loadError}</p>
          </Alert>
        </div>
      )}
      
      <a-scene embedded loading-screen="enabled: false" style={{ width: '100%', height: '100%' }}>
        <a-assets>
          <video 
            ref={videoRef}
            id="vr-video" 
            src={videoUrl} 
            preload="auto"
            crossOrigin="anonymous"
            playsInline
            webkit-playsinline="true"
            loop
          ></video>
        </a-assets>
        
        <a-videosphere 
          src="#vr-video" 
          rotation="0 -90 0"
          play-on-click
        ></a-videosphere>
        
        <a-camera position="0 1.6 0" look-controls="pointerLockEnabled: true">
          <a-cursor color="#FFFFFF"></a-cursor>
        </a-camera>
        
        <a-entity position="0 1.6 -3" text={`value: Click and drag to look around\nTap on video to play; width: 3; color: white; align: center;`}></a-entity>
      </a-scene>
    </div>
  );
};

export default VRPlayer; 