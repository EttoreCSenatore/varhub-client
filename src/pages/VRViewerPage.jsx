import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Alert, Spinner, Button } from 'react-bootstrap';
import 'aframe';

const VRViewerPage = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const location = useLocation();
  const videoRef = useRef(null);

  useEffect(() => {
    // Parse URL parameters to get the video URL
    const params = new URLSearchParams(location.search);
    const encodedVideoUrl = params.get('video');
    
    if (encodedVideoUrl) {
      try {
        const decodedUrl = decodeURIComponent(encodedVideoUrl);
        console.log("Loading VR video:", decodedUrl);
        setVideoUrl(decodedUrl);
        
        // Don't set loading to false until video is ready
        // This will happen in the video event listeners
      } catch (err) {
        console.error("Error parsing video URL:", err);
        setError("Invalid video URL parameter");
        setLoading(false);
      }
    } else {
      setError("No video URL provided");
      setLoading(false);
    }
  }, [location]);

  // Handle video events
  useEffect(() => {
    const handleVideoEvents = () => {
      const videoElement = document.getElementById('vrVideo');
      if (videoElement) {
        videoElement.addEventListener('loadedmetadata', () => {
          console.log("Video metadata loaded");
        });
        
        videoElement.addEventListener('canplay', () => {
          console.log("Video can play now");
          setVideoReady(true);
          setLoading(false);
        });
        
        videoElement.addEventListener('error', (e) => {
          console.error("Video error:", e);
          setError("Failed to load video. Please try a different format or URL.");
          setLoading(false);
        });

        // Force play on iOS
        videoElement.addEventListener('canplaythrough', () => {
          videoElement.play().catch(e => {
            console.warn("Auto-play prevented:", e);
          });
        });
        
        // Handle iOS video loading issues
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          setTimeout(() => {
            if (loading && !videoReady) {
              setLoading(false);
              console.log("Timeout for iOS video loading");
            }
          }, 5000);
        }
      }
    };
    
    // Set a timeout to allow the A-Frame scene to initialize
    if (videoUrl) {
      const timer = setTimeout(() => {
        handleVideoEvents();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [videoUrl, loading, videoReady]);

  // Go back to previous page
  const goBack = () => {
    window.history.back();
  };

  // Function to handle fullscreen toggle
  const enterFullscreen = () => {
    // For iOS, use a different approach
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // On iOS, trigger playback which will show fullscreen controls
      const videoElement = document.getElementById('vrVideo');
      if (videoElement) {
        videoElement.play().catch(err => console.warn("Play failed:", err));
      }
      return;
    }
    
    // For other browsers
    const scene = document.querySelector('a-scene');
    if (scene) {
      if (scene.requestFullscreen) {
        scene.requestFullscreen();
      } else if (scene.mozRequestFullScreen) { /* Firefox */
        scene.mozRequestFullScreen();
      } else if (scene.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        scene.webkitRequestFullscreen();
      } else if (scene.msRequestFullscreen) { /* IE/Edge */
        scene.msRequestFullscreen();
      }
    }
  };

  // Check if running on mobile device
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Enter VR mode directly
  const enterVR = () => {
    const scene = document.querySelector('a-scene');
    if (scene && scene.enterVR) {
      scene.enterVR();
    }
  };

  return (
    <Container fluid className="p-0 vh-100 position-relative">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <Spinner animation="border" variant="primary" />
          <span className="ms-2">Loading VR video...</span>
        </div>
      ) : error ? (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <Alert variant="danger" className="text-center">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
          <Button variant="primary" onClick={goBack}>
            Go Back
          </Button>
        </div>
      ) : (
        <>
          {/* A-Frame VR Scene */}
          <a-scene 
            embedded 
            vr-mode-ui="enabled: true; cardboardModeEnabled: true;" 
            device-orientation-permission-ui="enabled: true"
            loading-screen="enabled: true; dotsColor: white; backgroundColor: black"
          >
            <a-assets>
              <video 
                id="vrVideo" 
                src={videoUrl} 
                autoPlay 
                playsInline
                loop 
                crossOrigin="anonymous"
                ref={videoRef}
                preload="auto"
                muted
                playsinline="true"
                webkit-playsinline="true"
              ></video>
            </a-assets>
            
            <a-videosphere 
              src="#vrVideo" 
              rotation="0 -90 0"
              play-on-click
            ></a-videosphere>
            
            {/* Add camera with controls for looking around */}
            <a-entity position="0 1.6 0">
              <a-camera look-controls="reverseMouseDrag: false" wasd-controls-enabled="false">
                <a-entity
                  position="0 0 -1.5"
                  geometry="primitive: ring; radiusOuter: 0.03; radiusInner: 0.02;"
                  material="color: white; shader: flat; opacity: 0.5"
                  cursor="fuse: false"
                  raycaster="far: 20; interval: 1000; objects: .clickable"
                ></a-entity>
              </a-camera>
            </a-entity>
            
            {/* Button to play video (needed for iOS) */}
            <a-entity 
              position="0 1.5 -2" 
              geometry="primitive: plane; width: 2; height: 1" 
              material="color: #333; opacity: 0.7" 
              class="clickable"
              visible={!videoReady}
              text="value: Tap to play video; align: center; width: 4; color: white"
              event-set__click="_event: click; _target: #vrVideo; _delay: 0; visible: false"
              proxy-event__click="_event: click; _target: #vrVideo; _as: play"
            ></a-entity>
          </a-scene>
          
          {/* Control panel overlay */}
          <div className="position-absolute top-0 start-0 w-100 p-3 d-flex justify-content-between align-items-center" style={{ zIndex: 999, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Button variant="light" size="sm" onClick={goBack}>
              ← Back
            </Button>
            <div>
              {isMobile() && (
                <Button variant="primary" size="sm" onClick={enterVR} className="me-2">
                  Enter VR Mode
                </Button>
              )}
              <Button variant="info" size="sm" onClick={enterFullscreen}>
                Fullscreen
              </Button>
            </div>
          </div>
        </>
      )}
    </Container>
  );
};

export default VRViewerPage; 