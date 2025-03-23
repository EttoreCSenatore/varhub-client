import React, { useEffect, useRef, useState } from 'react';
import 'aframe';
import { Spinner } from 'react-bootstrap';

const VRPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    // Reset loading state when video URL changes
    setIsLoading(true);
    setIsPlaying(false);
    
    // Handle play/pause when aframe scene is loaded
    const scene = document.querySelector('a-scene');
    if (scene) {
      if (scene.hasLoaded) {
        handleSceneLoaded();
      } else {
        scene.addEventListener('loaded', handleSceneLoaded);
      }
    }
    
    return () => {
      const scene = document.querySelector('a-scene');
      if (scene) {
        scene.removeEventListener('loaded', handleSceneLoaded);
      }
    };
  }, [videoUrl]);
  
  const handleSceneLoaded = () => {
    // Handle scene loaded
    if (videoRef.current) {
      // Add click event to toggle play/pause
      const videosphere = document.querySelector('a-videosphere');
      if (videosphere) {
        videosphere.addEventListener('click', togglePlayPause);
      }
      
      // Track video loading
      videoRef.current.addEventListener('loadeddata', () => {
        setIsLoading(false);
      });
      
      // Track video play state
      videoRef.current.addEventListener('play', () => setIsPlaying(true));
      videoRef.current.addEventListener('pause', () => setIsPlaying(false));
      
      // Attempt autoplay
      try {
        videoRef.current.play().catch((e) => {
          console.log('Autoplay prevented by browser:', e);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error playing video:', error);
        setIsLoading(false);
      }
    }
  };
  
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="vr-player-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 10
          }}
        >
          <div className="text-center text-white">
            <Spinner animation="border" role="status" />
            <p className="mt-2">Loading VR experience...</p>
          </div>
        </div>
      )}
    
      <a-scene embedded vr-mode-ui="enabled: true">
        <a-assets>
          <video 
            id="vrVideo" 
            ref={videoRef}
            src={videoUrl} 
            crossOrigin="anonymous"
            loop
            playsInline
            preload="auto"
          ></video>
        </a-assets>
        
        <a-videosphere src="#vrVideo" rotation="0 180 0"></a-videosphere>
        
        <a-camera>
          <a-cursor color="white"></a-cursor>
        </a-camera>
        
        <a-entity 
          position="0 -1.6 -2" 
          text={`value: Click to ${isPlaying ? 'pause' : 'play'}; align: center; width: 2; color: white`}
        ></a-entity>
        
        {/* Instructions */}
        <a-entity 
          position="0 1.7 -2" 
          text="value: Drag to look around in 360°; align: center; width: 2; color: white">
        </a-entity>
        
        {/* VR Mode Prompt */}
        <a-entity 
          position="0 1.5 -2" 
          text="value: Enter VR for immersive experience; align: center; width: 2; color: white">
        </a-entity>
      </a-scene>
    </div>
  );
};

export default VRPlayer; 