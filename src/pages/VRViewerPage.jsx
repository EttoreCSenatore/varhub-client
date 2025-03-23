import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Alert, Spinner, Button } from 'react-bootstrap';
import 'aframe';

const VRViewerPage = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Parse URL parameters to get the video URL
    const params = new URLSearchParams(location.search);
    const encodedVideoUrl = params.get('video');
    
    if (encodedVideoUrl) {
      try {
        const decodedUrl = decodeURIComponent(encodedVideoUrl);
        console.log("Loading VR video:", decodedUrl);
        setVideoUrl(decodedUrl);
        setLoading(false);
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

  // Go back to previous page
  const goBack = () => {
    window.history.back();
  };

  // Function to handle fullscreen toggle
  const enterFullscreen = () => {
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

  return (
    <Container fluid className="p-0 vh-100 position-relative">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <Spinner animation="border" variant="primary" />
          <span className="ms-2">Loading VR viewer...</span>
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
          <a-scene embedded vr-mode-ui="enabled: true">
            <a-assets>
              <video 
                id="vrVideo" 
                src={videoUrl} 
                autoPlay 
                loop 
                crossOrigin="anonymous"
                playsInline
              ></video>
            </a-assets>
            <a-videosphere 
              src="#vrVideo" 
              rotation="0 -90 0"
            ></a-videosphere>
            {/* Add camera controls for looking around */}
            <a-camera>
              <a-cursor></a-cursor>
            </a-camera>
          </a-scene>
          
          {/* Control panel overlay */}
          <div className="position-absolute top-0 start-0 w-100 p-3 d-flex justify-content-between" style={{ zIndex: 999 }}>
            <Button variant="light" onClick={goBack}>
              ← Back
            </Button>
            <Button variant="primary" onClick={enterFullscreen}>
              Enter Fullscreen
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default VRViewerPage; 