import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Alert, Spinner, Button } from 'react-bootstrap';
import 'aframe';
import ReactPlayer from 'react-player';

const VRViewerPage = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [useDirectPlayer, setUseDirectPlayer] = useState(false);
  const location = useLocation();
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    // Parse URL parameters to get the video URL
    const params = new URLSearchParams(location.search);
    const encodedVideoUrl = params.get('video');
    
    if (encodedVideoUrl) {
      try {
        const decodedUrl = decodeURIComponent(encodedVideoUrl);
        console.log("Loading VR video:", decodedUrl);
        setVideoUrl(decodedUrl);
        
        // Set a timeout to handle stuck loading states
        const timer = setTimeout(() => {
          if (loading) {
            console.log("Loading timeout reached - video might be having issues");
            setLoadingTimeout(true);
          }
        }, 8000);
        
        return () => clearTimeout(timer);
      } catch (err) {
        console.error("Error parsing video URL:", err);
        setError("Invalid video URL parameter");
        setLoading(false);
      }
    } else {
      setError("No video URL provided");
      setLoading(false);
    }
  }, [location, loading]);

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
          setUseDirectPlayer(true);
          setLoading(false);
        });

        // Force play on iOS
        videoElement.addEventListener('canplaythrough', () => {
          videoElement.play().catch(e => {
            console.warn("Auto-play prevented:", e);
          });
        });
        
        // Check if video source was really loaded
        videoElement.addEventListener('loadeddata', () => {
          console.log("Video data loaded successfully");
          setLoading(false);
          setVideoReady(true);
        });
      }
    };
    
    // Set a timeout to allow the A-Frame scene to initialize
    if (videoUrl) {
      const timer = setTimeout(() => {
        handleVideoEvents();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [videoUrl]);

  // Go back to previous page
  const goBack = () => {
    window.history.back();
  };

  // Function to handle fullscreen toggle
  const enterFullscreen = () => {
    if (useDirectPlayer) {
      // If using direct player, use its fullscreen capability
      const videoElement = document.querySelector('video');
      if (videoElement && videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      }
      return;
    }
    
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
    return /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  // Enter VR mode directly
  const enterVR = () => {
    const scene = document.querySelector('a-scene');
    if (scene && scene.enterVR) {
      scene.enterVR();
    }
  };

  // Switch to direct player mode
  const switchToDirectPlayer = () => {
    setUseDirectPlayer(true);
    setLoading(false);
  };

  return (
    <Container fluid className="p-0 vh-100 position-relative">
      {loading && !loadingTimeout ? (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <Spinner animation="border" variant="primary" />
          <span className="ms-2 mb-3">Loading VR video...</span>
          
          {loadingTimeout && (
            <Button 
              variant="warning" 
              onClick={switchToDirectPlayer}
              className="mt-3"
            >
              Use Standard Video Player
            </Button>
          )}
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
      ) : useDirectPlayer ? (
        <div className="vh-100 d-flex flex-column">
          <div className="position-absolute top-0 start-0 w-100 p-3 d-flex justify-content-between align-items-center" style={{ zIndex: 999, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Button variant="light" size="sm" onClick={goBack}>
              ← Back
            </Button>
            <Button variant="info" size="sm" onClick={enterFullscreen}>
              Fullscreen
            </Button>
          </div>
          
          <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-dark">
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              width="100%"
              height="100%"
              playing
              controls
              config={{
                file: {
                  attributes: {
                    crossOrigin: "anonymous",
                    style: { maxHeight: '100vh', maxWidth: '100%' }
                  }
                }
              }}
            />
          </div>
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
            <a-assets timeout="30000">
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
              <Button variant="warning" size="sm" onClick={switchToDirectPlayer} className="me-2">
                Standard Player
              </Button>
              <Button variant="info" size="sm" onClick={enterFullscreen}>
                Fullscreen
              </Button>
            </div>
          </div>
          
          {/* Loading timeout message */}
          {loadingTimeout && !videoReady && (
            <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-dark bg-opacity-75 text-white text-center">
              <p className="mb-2">Video is taking longer than expected to load.</p>
              <Button 
                variant="warning" 
                onClick={switchToDirectPlayer}
                className="me-2"
              >
                Try Standard Player
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default VRViewerPage; 