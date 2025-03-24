import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Alert, Spinner, Button } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import 'aframe';

const VRViewerPage = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useSimplePlayer, setUseSimplePlayer] = useState(false);
  const location = useLocation();
  const vrSceneRef = useRef(null);
  
  useEffect(() => {
    // Parse URL parameters to get the video URL
    const params = new URLSearchParams(location.search);
    const encodedVideoUrl = params.get('video');
    
    if (encodedVideoUrl) {
      try {
        const decodedUrl = decodeURIComponent(encodedVideoUrl);
        console.log("Loading video:", decodedUrl);
        setVideoUrl(decodedUrl);
        
        // Set a timeout to automatically switch to simple player if VR mode takes too long
        const timer = setTimeout(() => {
          if (loading) {
            console.log("Loading timeout - switching to simple player");
            setUseSimplePlayer(true);
            setLoading(false);
          }
        }, 5000);
        
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
  }, [location.search, loading]);

  // Go back to previous page
  const goBack = () => {
    window.history.back();
  };

  // Switch to simple player view
  const switchToSimplePlayer = () => {
    setUseSimplePlayer(true);
    setLoading(false);
  };
  
  // Once the Aframe scene has loaded
  const handleSceneLoaded = () => {
    setLoading(false);
    console.log("VR Scene loaded");
    
    // Make sure video element is properly configured
    setTimeout(() => {
      const videoEl = document.getElementById('vr-video');
      if (videoEl) {
        // Set src both ways for better compatibility
        if (videoUrl) {
          videoEl.src = videoUrl;
          videoEl.setAttribute('src', videoUrl);
        }
        
        // Make sure CORS is properly handled
        videoEl.crossOrigin = "anonymous";
        
        // Try to play with fallback for interaction requirement
        videoEl.play().catch(err => {
          console.warn("Could not autoplay video:", err);
          // We'll rely on the tap button for user to manually start
        });
      }
    }, 500); // Short delay for DOM to be ready
  };

  return (
    <Container fluid className="p-0 m-0 vh-100 position-relative">
      {loading ? (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 mb-4">Loading video...</p>
          <Button variant="secondary" onClick={switchToSimplePlayer}>
            Switch to Simple Player
          </Button>
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
      ) : useSimplePlayer ? (
        /* Simple Video Player View */
        <div className="vh-100 d-flex flex-column">
          <div className="p-2 bg-dark text-white d-flex justify-content-between">
            <Button variant="outline-light" size="sm" onClick={goBack}>
              Back
            </Button>
            <h5 className="m-0">Video Player</h5>
            <div style={{ width: '50px' }}></div> {/* spacer for flex alignment */}
          </div>
          
          <div className="flex-grow-1 bg-black d-flex align-items-center justify-content-center">
            <ReactPlayer
              url={videoUrl}
              controls
              playing
              width="100%"
              height="100%"
              config={{
                file: {
                  attributes: {
                    crossOrigin: "anonymous",
                    controlsList: "nodownload",
                    playsInline: true,
                    preload: "auto"
                  }
                }
              }}
            />
          </div>
        </div>
      ) : (
        /* VR Scene for 360 Video */
        <div className="vh-100 position-relative">
          {/* Control panel overlay */}
          <div className="position-absolute top-0 start-0 w-100 p-2 d-flex justify-content-between" 
            style={{ zIndex: 100, backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <Button variant="outline-light" size="sm" onClick={goBack}>
              Back to Projects
            </Button>
            <Button variant="outline-light" size="sm" onClick={switchToSimplePlayer}>
              Standard Player
            </Button>
          </div>
          
          {/* Direct video element for better compatibility with S3 */}
          <div className="vh-100 bg-black d-flex align-items-center justify-content-center">
            <div style={{ width: '100%', height: '100%' }}>
              <a-scene 
                ref={vrSceneRef}
                embedded
                loading-screen="dotsColor: white; backgroundColor: black"
                vr-mode-ui="enabled: true"
                device-orientation-permission-ui="enabled: true"
                onLoaded={handleSceneLoaded}
              >
                <a-assets>
                  <video
                    id="vr-video"
                    preload="auto"
                    crossOrigin="anonymous"
                    playsInline
                    loop
                    muted
                    webkit-playsinline="true"
                    style={{ display: 'none' }}
                  ></video>
                </a-assets>
                
                <a-videosphere 
                  src="#vr-video"
                  rotation="0 -90 0"
                ></a-videosphere>
                
                <a-camera position="0 1.6 0" wasd-controls-enabled="false">
                  <a-cursor color="#FFFFFF"></a-cursor>
                </a-camera>
                
                {/* Floating play button for mobile */}
                <a-entity
                  position="0 1.5 -3"
                  geometry="primitive: plane; width: 3; height: 1"
                  material="color: #333; opacity: 0.8"
                  text="value: Tap here to play video; width: 3; color: white; align: center"
                  onClick={() => {
                    const video = document.getElementById('vr-video');
                    if (video) {
                      video.muted = false;
                      if (video.paused) {
                        video.play().catch(err => {
                          console.error("Error playing video:", err);
                          // If we still have issues, switch to simple player
                          switchToSimplePlayer();
                        });
                      }
                    }
                  }}
                ></a-entity>
              </a-scene>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default VRViewerPage; 