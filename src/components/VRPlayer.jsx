import React, { useEffect, useRef } from 'react';
import 'aframe';

const VRPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  
  useEffect(() => {
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
      
      // Attempt autoplay
      try {
        videoRef.current.play().catch((e) => {
          console.log('Autoplay prevented by browser:', e);
        });
      } catch (error) {
        console.error('Error playing video:', error);
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
      
      <a-entity position="0 -1.6 -2" text="value: Click to play/pause; align: center; width: 2"></a-entity>
    </a-scene>
  );
};

export default VRPlayer; 