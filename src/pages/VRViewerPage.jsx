import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Alert, Spinner, Button } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import 'aframe';
// Import additional A-Frame components for interaction
import 'aframe-environment-component';
import { 
  createCorsProxyUrl, 
  setupCorsVideoElement, 
  setupDirectVideoElement, 
  tryNextCorsProxy,
  createLocalVideoUrl,
  s3CorsConfigInstructions 
} from '../utils/cors-proxy';
import { 
  isWebXRSupported, 
  isImmersiveVRSupported, 
  createInteractiveObject, 
  createTextPanel,
  initializeControllers
} from '../utils/webxr-utils';

// Register a custom component for controller interaction
if (typeof window !== 'undefined') {
  window.AFRAME.registerComponent('controller-interaction', {
    init: function() {
      this.el.addEventListener('gripdown', this.onGripDown.bind(this));
      this.el.addEventListener('gripup', this.onGripUp.bind(this));
      this.el.addEventListener('thumbstickmoved', this.onThumbstickMoved.bind(this));
      
      // Set up initial state
      this.isGrabbing = false;
      this.originalPosition = new window.THREE.Vector3();
      this.originalScale = new window.THREE.Vector3();
    },
    
    onGripDown: function(evt) {
      const intersectedEls = document.querySelectorAll('[data-interactive]');
      for (let el of intersectedEls) {
        const distance = this.el.object3D.position.distanceTo(el.object3D.position);
        if (distance < 1.5) {
          this.isGrabbing = true;
          this.grabbedEl = el;
          this.originalPosition.copy(el.object3D.position);
          this.originalScale.copy(el.object3D.scale);
          el.setAttribute('material', 'color', '#ffcc00');
        }
      }
    },
    
    onGripUp: function() {
      if (this.isGrabbing && this.grabbedEl) {
        this.isGrabbing = false;
        this.grabbedEl.setAttribute('material', 'color', '#ffffff');
        this.grabbedEl = null;
      }
    },
    
    onThumbstickMoved: function(evt) {
      if (this.isGrabbing && this.grabbedEl) {
        // Scale object based on thumbstick y-axis
        const scaleFactor = 1 + (evt.detail.y * 0.1);
        const newScale = this.originalScale.clone().multiplyScalar(scaleFactor);
        this.grabbedEl.object3D.scale.copy(newScale);
      }
    }
  });
  
  // Register a component for video control
  window.AFRAME.registerComponent('video-controls', {
    init: function() {
      this.videoEl = document.getElementById('vr-video');
      if (!this.videoEl) return;
      
      // Add event listeners for buttons
      this.el.addEventListener('click', this.togglePlay.bind(this));
      
      // Create UI elements
      this.createUIElements();
    },
    
    createUIElements: function() {
      // Create play/pause button
      const playButton = document.createElement('a-entity');
      playButton.setAttribute('geometry', 'primitive: plane; width: 0.5; height: 0.5');
      playButton.setAttribute('material', 'color: #333; opacity: 0.8');
      playButton.setAttribute('position', '0 0 0.01');
      playButton.setAttribute('text', 'value: ▶; width: 2; color: white; align: center');
      playButton.setAttribute('class', 'play-button');
      
      this.el.appendChild(playButton);
      this.playButton = playButton;
    },
    
    togglePlay: function() {
      if (!this.videoEl) return;
      
      if (this.videoEl.paused) {
        this.videoEl.play().then(() => {
          this.playButton.setAttribute('text', 'value: ⏸');
        }).catch(err => {
          console.error('Error playing video:', err);
        });
      } else {
        this.videoEl.pause();
        this.playButton.setAttribute('text', 'value: ▶');
      }
    }
  });
}

const VRViewerPage = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const [localVideoUrl, setLocalVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useSimplePlayer, setUseSimplePlayer] = useState(false);
  const [corsError, setCorsError] = useState(false);
  const [showControllerHelp, setShowControllerHelp] = useState(true);
  const [vrSupported, setVrSupported] = useState(true);
  const [currentProxyIndex, setCurrentProxyIndex] = useState(0);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const location = useLocation();
  const vrSceneRef = useRef(null);
  const videoElementRef = useRef(null);
  
  // Check WebXR support on component mount
  useEffect(() => {
    const checkXrSupport = async () => {
      const supported = await isImmersiveVRSupported();
      setVrSupported(supported);
      console.log('WebXR VR support:', supported ? 'Yes' : 'No');
    };
    
    checkXrSupport();
  }, []);
  
  useEffect(() => {
    // Parse URL parameters to get the video URL
    const params = new URLSearchParams(location.search);
    const encodedVideoUrl = params.get('video');
    
    if (encodedVideoUrl) {
      try {
        const decodedUrl = decodeURIComponent(encodedVideoUrl);
        console.log("Loading video:", decodedUrl);
        setVideoUrl(decodedUrl);
        
        // Get a proxied URL for S3 URLs, but don't rely on it completely
        const proxiedUrl = createCorsProxyUrl(decodedUrl);
        if (proxiedUrl !== decodedUrl) {
          console.log("Generated proxy URL:", proxiedUrl);
          setProxyUrl(proxiedUrl);
          
          // Also try to download the video for local playback
          handleLocalVideoDownload(decodedUrl);
        }
        
        // Set a timeout to automatically switch to simple player if VR mode takes too long
        const timer = setTimeout(() => {
          if (loading) {
            console.log("Loading timeout - switching to simple player");
            setUseSimplePlayer(true);
            setLoading(false);
          }
        }, 15000); // Increased to 15 seconds to allow for video download
        
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

  // Try to download video for local playback
  const handleLocalVideoDownload = async (url) => {
    if (!url) return;
    
    setIsDownloadingVideo(true);
    console.log("Attempting to download video for local playback");
    
    try {
      const localUrl = await createLocalVideoUrl(url);
      if (localUrl) {
        console.log("Successfully created local video URL");
        setLocalVideoUrl(localUrl);
      }
    } catch (err) {
      console.error("Failed to download video:", err);
    } finally {
      setIsDownloadingVideo(false);
    }
  };

  // Try next proxy when the current one fails
  const handleProxyError = () => {
    if (currentProxyIndex < 4) { // We have 5 proxies (0-4)
      const nextIndex = currentProxyIndex + 1;
      const nextProxyUrl = tryNextCorsProxy(videoUrl, currentProxyIndex);
      
      console.log(`Switching to proxy #${nextIndex}: ${nextProxyUrl}`);
      setCurrentProxyIndex(nextIndex);
      setProxyUrl(nextProxyUrl);
      
      // Update video with new proxy
      if (videoElementRef.current) {
        setupCorsVideoElement(videoElementRef.current, videoUrl, nextIndex);
      }
      
      return true;
    }
    
    // If we've tried all proxies, set CORS error
    setCorsError(true);
    return false;
  };

  // Hide controller help after a delay
  useEffect(() => {
    if (!loading && !useSimplePlayer) {
      const timer = setTimeout(() => {
        setShowControllerHelp(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [loading, useSimplePlayer]);

  // Go back to previous page
  const goBack = () => {
    window.history.back();
  };

  // Switch to simple player view
  const switchToSimplePlayer = () => {
    setUseSimplePlayer(true);
    setLoading(false);
  };
  
  // Handle video element error
  const handleVideoError = (event) => {
    console.error("Video error:", event);
    
    // Try next proxy before giving up
    if (!handleProxyError()) {
      setCorsError(true);
      // Auto-switch to simple player on video error
      switchToSimplePlayer();
    }
  };
  
  // Function to try different methods of loading the video
  const tryLoadingWithVariousApproaches = (videoEl) => {
    if (!videoEl) return;
    
    console.log("Trying multiple approaches to load the video");
    
    // Store ref for global access
    videoElementRef.current = videoEl;
    
    // Add error listener
    videoEl.addEventListener('error', handleVideoError);
    
    // Try approaches in order:
    // 1. Local blob URL if available (most reliable)
    // 2. Direct approach with CORS headers
    // 3. Proxy approach
    
    if (localVideoUrl) {
      console.log("Approach 1: Using locally downloaded video");
      videoEl.src = localVideoUrl;
      videoEl.load();
    } else {
      // Try direct approach first
      try {
        console.log("Approach 2: Direct loading with CORS headers");
        setupDirectVideoElement(videoEl, videoUrl);
        
        // If direct fails after a short delay, try proxy
        setTimeout(() => {
          if (videoEl.networkState === 3) { // NETWORK_NO_SOURCE
            console.log("Direct loading failed, trying proxy approach");
            setupCorsVideoElement(videoEl, videoUrl, currentProxyIndex);
          }
        }, 3000);
      } catch (e) {
        console.error("Error setting up video element:", e);
        if (proxyUrl) {
          setupCorsVideoElement(videoEl, videoUrl, currentProxyIndex);
        }
      }
    }
  };
  
  // Once the Aframe scene has loaded
  const handleSceneLoaded = () => {
    setLoading(false);
    console.log("VR Scene loaded");
    
    // Make sure video element is properly configured
    setTimeout(() => {
      const videoEl = document.getElementById('vr-video');
      if (videoEl) {
        // Try multiple approaches for loading the video
        tryLoadingWithVariousApproaches(videoEl);
        
        // Try to play with fallback for interaction requirement
        videoEl.play().catch(err => {
          console.warn("Could not autoplay video:", err);
          // We'll rely on the tap button for user to manually start
        });
      }
      
      // Add interactive objects after the scene loads
      const scene = document.querySelector('a-scene');
      if (scene) {
        // Create interactive objects
        createInteractiveObject(scene, {
          position: '-1.5 1.5 -2',
          color: '#4CC3D9',
          shape: 'box',
          size: 0.5
        });
        
        createInteractiveObject(scene, {
          position: '1.5 1.5 -2',
          color: '#EF2D5E',
          shape: 'sphere',
          size: 0.5
        });
        
        createInteractiveObject(scene, {
          position: '0 1 -3',
          color: '#FFC65D',
          shape: 'cylinder',
          size: 0.4
        });
        
        // Create controllers
        initializeControllers(scene);
        
        // Add text panel with instructions
        createTextPanel(scene, 'VR House Tour - Grab objects using controller grip buttons', {
          position: '0 2.2 -3',
          width: 4,
          height: 0.8
        });
      }
    }, 1000);
  };

  // Try next CORS proxy
  const handleTryNextProxy = () => {
    if (handleProxyError()) {
      // If we switched to a new proxy successfully, reload the current view
      if (useSimplePlayer) {
        // For simple player, just toggle and come back
        setUseSimplePlayer(false);
        setTimeout(() => setUseSimplePlayer(true), 100);
      } else {
        // For VR scene, reload scene
        const scene = document.querySelector('a-scene');
        if (scene) {
          const videoEl = document.getElementById('vr-video');
          if (videoEl) {
            tryLoadingWithVariousApproaches(videoEl);
          }
        }
      }
    }
  };

  return (
    <Container fluid className="p-0 m-0 vh-100 position-relative">
      {loading ? (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 mb-4">
            {isDownloadingVideo ? "Downloading video for local playback..." : "Loading video..."}
          </p>
          <Button variant="secondary" onClick={switchToSimplePlayer}>
            Switch to Simple Player
          </Button>
          
          {!vrSupported && (
            <Alert variant="info" className="mt-3">
              <small>WebXR VR mode not supported in this browser. 
              Some features may be limited.</small>
            </Alert>
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
          
          {corsError && (
            <Alert variant="warning" className="m-2">
              <Alert.Heading>CORS Access Issue</Alert.Heading>
              <p>
                The video cannot be accessed due to cross-origin restrictions. 
                The S3 bucket needs to be configured to allow access from this website.
              </p>
              <div className="d-flex justify-content-end">
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={handleTryNextProxy}
                  className="me-2"
                >
                  Try Different CORS Proxy
                </Button>
              </div>
              <hr />
              <p className="mb-0">
                <strong>S3 Bucket Owner:</strong> Please add the following CORS configuration to your bucket:
              </p>
              <pre className="bg-light p-2 mt-2" style={{whiteSpace: 'pre-wrap'}}>{s3CorsConfigInstructions}</pre>
            </Alert>
          )}
          
          <div className="flex-grow-1 bg-black d-flex align-items-center justify-content-center">
            <ReactPlayer
              url={localVideoUrl || proxyUrl || videoUrl} // Try local URL first, then proxy, then original
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
              onError={(e) => {
                console.error("ReactPlayer error:", e);
                // Try next proxy
                if (!handleProxyError()) {
                  setCorsError(true);
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
            <div>
              {corsError && (
                <Button 
                  variant="outline-warning" 
                  size="sm" 
                  onClick={handleTryNextProxy}
                  className="me-2"
                >
                  Try Different CORS Proxy
                </Button>
              )}
              <Button variant="outline-light" size="sm" onClick={switchToSimplePlayer}>
                Standard Player
              </Button>
            </div>
          </div>
          
          {/* Controller help overlay */}
          {showControllerHelp && (
            <div className="position-absolute top-50 start-50 translate-middle p-3" 
                style={{ zIndex: 99, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '10px' }}>
              <h5 className="text-white text-center">VR Controls:</h5>
              <ul className="text-white mb-0">
                <li>Use grip button to grab interactive objects</li>
                <li>Use thumbstick to resize objects</li>
                <li>Tap video sphere to start playback</li>
                <li>Use laser pointer to interact with objects</li>
              </ul>
            </div>
          )}
          
          {/* CORS error message in VR view */}
          {corsError && (
            <div className="position-absolute bottom-0 start-50 translate-middle-x p-2 mb-2"
                style={{ zIndex: 98, backgroundColor: 'rgba(255,193,7,0.8)', borderRadius: '5px', maxWidth: '80%' }}>
              <p className="text-dark mb-1"><small><strong>CORS Issue:</strong> Using proxy to access video. Performance may be affected.</small></p>
            </div>
          )}
          
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
                <a-assets timeout="10000">
                  <video
                    id="vr-video"
                    preload="auto"
                    crossOrigin="anonymous"
                    playsInline
                    loop
                    muted
                    webkit-playsinline="true"
                    style={{ display: 'none' }}
                    onError={handleVideoError}
                  ></video>
                </a-assets>
                
                {/* Environment background (subtle) */}
                <a-entity 
                  environment="preset: default; 
                              skyType: gradient; 
                              skyColor: #111; 
                              horizonColor: #333;
                              lighting: minimal; 
                              shadow: false; 
                              fog: 0.9;
                              playArea: 1"
                ></a-entity>
                
                <a-videosphere 
                  id="video-sphere"
                  src="#vr-video"
                  rotation="0 -90 0"
                ></a-videosphere>
                
                {/* Camera with cursor for gaze-based interaction */}
                <a-camera position="0 1.6 0" wasd-controls-enabled="true">
                  <a-cursor color="#FFFFFF"></a-cursor>
                </a-camera>
                
                {/* Video control panel */}
                <a-entity
                  position="0 1 -2"
                  rotation="0 0 0"
                  geometry="primitive: plane; width: 1; height: 0.5"
                  material="color: #333; opacity: 0.8"
                  video-controls
                  data-interactive="true"
                ></a-entity>
                
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
                
                {/* Note: Additional interactive objects are added programmatically in handleSceneLoaded */}
              </a-scene>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default VRViewerPage; 