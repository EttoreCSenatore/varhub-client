import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { Html5Qrcode } from 'html5-qrcode';
import { Spinner, Alert, Button, Card } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import 'aframe';
import { createCorsProxyUrl, setupCorsVideoElement, setupDirectVideoElement, s3CorsConfigInstructions } from '../utils/cors-proxy';

const QRScanner = () => {
  // State for QR scanning
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [useSimplePlayer, setUseSimplePlayer] = useState(false);
  const [showVrViewer, setShowVrViewer] = useState(false);
  const [proxyUrl, setProxyUrl] = useState(null);
  const [corsError, setCorsError] = useState(false);
  
  // State for camera controls
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanningActive, setScanningActive] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [qrDetected, setQrDetected] = useState(false);
  
  // Refs for video and canvas elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scannerIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const html5QrScannerRef = useRef(null);
  const qrReaderDivRef = useRef(null);
  const vrSceneRef = useRef(null);

  // Start or stop camera based on cameraActive state
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    
    // Cleanup function
    return () => {
      stopCamera();
    };
  }, [cameraActive]);

  // Start camera function
  const startCamera = async () => {
    try {
      setCameraError(null);
      
      // Try the HTML5QR scanner first
      if (qrReaderDivRef.current) {
        try {
          const html5QrScanner = new Html5Qrcode("qr-reader");
          html5QrScannerRef.current = html5QrScanner;
          
          const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };
          
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            const cameraId = cameras[cameras.length - 1].id; // Use the last camera (usually back camera on phones)
            
            html5QrScanner.start(
              cameraId, 
              qrConfig,
              (decodedText) => {
                console.log("QR Code detected via Html5Qrcode:", decodedText);
                setResult(decodedText);
                processQrCodeResult(decodedText);
                html5QrScanner.stop();
                setScanningActive(false);
                setQrDetected(true);
              },
              (errorMessage) => {
                // QR Code scanning is ongoing, ignore intermediate errors
                if (scanAttempts % 50 === 0) {
                  console.log(`Html5Qrcode scanning ongoing...`, errorMessage);
                }
              }
            )
            .catch((err) => {
              console.error("Html5Qrcode failed to start camera, falling back to manual implementation", err);
              startLegacyCamera();
            });
            
            setScanningActive(true);
            return;
          } else {
            console.warn("No cameras found via Html5Qrcode, falling back to manual implementation");
            startLegacyCamera();
          }
        } catch (err) {
          console.error("Error initializing Html5Qrcode, falling back to manual implementation", err);
          startLegacyCamera();
        }
      } else {
        startLegacyCamera();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError' 
          ? 'Camera access denied. Please grant permission to use your camera.'
          : `Camera error: ${err.message || 'Could not access camera'}`
      );
      setCameraActive(false);
    }
  };
  
  // Start camera using the legacy approach (manual frame processing)
  const startLegacyCamera = async () => {
    try {
      const constraints = { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setScanningActive(true);
          startScanning();
        };
      }
    } catch (err) {
      console.error('Legacy camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError' 
          ? 'Camera access denied. Please grant permission to use your camera.'
          : `Camera error: ${err.message || 'Could not access camera'}`
      );
      setCameraActive(false);
    }
  };

  // Stop camera function
  const stopCamera = () => {
    // Stop Html5Qrcode scanner if active
    if (html5QrScannerRef.current) {
      try {
        html5QrScannerRef.current.stop().catch(err => {
          console.error("Failed to stop Html5Qrcode scanner:", err);
        });
        html5QrScannerRef.current = null;
      } catch (err) {
        console.error("Error stopping Html5Qrcode:", err);
      }
    }
    
    // Stop legacy video stream if active
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear manual scanning interval if active
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current);
      scannerIntervalRef.current = null;
    }
    
    setScanningActive(false);
  };
  
  // Start QR scanning
  const startScanning = () => {
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current);
    }
    
    // First try immediately
    processFrame();
    
    scannerIntervalRef.current = setInterval(() => {
      processFrame();
      // Increment scan attempts to give some feedback about ongoing scanning
      setScanAttempts(prev => prev + 1);
    }, 100); // Scan more frequently (every 100ms instead of 200ms)
  };

  // Process video frame to detect QR code
  const processFrame = () => {
    if (!videoRef.current || !canvasRef.current || !scanningActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
    
    // Match canvas dimensions to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Make sure we have valid image data
      if (imageData.width === 0 || imageData.height === 0) {
        console.warn("Invalid image data dimensions");
        return;
      }
      
      // Debug info
      if (scanAttempts % 10 === 0) {
        console.log(`Scanning frame: ${canvas.width}x${canvas.height}`);
      }
      
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth", // Try both normal and inverted
      });
      
      if (qrCode) {
        console.log("QR code detected:", qrCode.data);
        // QR code detected
        setResult(qrCode.data);
        processQrCodeResult(qrCode.data);
        
        // Stop scanning once a QR code is found
        clearInterval(scannerIntervalRef.current);
        setScanningActive(false);
        setQrDetected(true);
        
        // Draw QR code location on canvas for visual feedback
        drawQRCodeHighlight(context, qrCode.location);
        
        // Make the canvas visible for feedback
        canvasRef.current.style.display = 'block';
      }
    } catch (err) {
      console.error('QR scan error:', err);
      setError(`QR scanning error: ${err.message || 'Failed to process image'}`);
    }
  };
  
  // Draw a highlight around the detected QR code
  const drawQRCodeHighlight = (context, location) => {
    context.lineWidth = 4;
    context.strokeStyle = "#FF3B58";
    
    context.beginPath();
    context.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
    context.lineTo(location.topRightCorner.x, location.topRightCorner.y);
    context.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
    context.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
    context.lineTo(location.topLeftCorner.x, location.topLeftCorner.y);
    context.stroke();
  };
  
  // Reset scanner to try again
  const resetScanner = () => {
    setResult('');
    setVideoUrl(null);
    setError(null);
    setScanAttempts(0);
    setQrDetected(false);
    setShowVrViewer(false);
    setUseSimplePlayer(false);
    setCameraActive(true);
  };

  // Process QR code result (URL)
  const processQrCodeResult = (url) => {
    setLoading(true);
    setError(null);
    setCorsError(false);

    try {
      // Basic validation to check if it's a URL
      if (isValidUrl(url)) {
        console.log("Valid URL detected:", url);
        
        // Check if it's a video URL
        if (isVideoUrl(url)) {
          console.log("Video URL detected, loading in embedded viewer");
          
          // Generate a proxy URL if needed, but don't rely on it yet
          const proxiedUrl = createCorsProxyUrl(url);
          if (proxiedUrl !== url) {
            console.log("Generated proxy URL:", proxiedUrl);
            setProxyUrl(proxiedUrl);
          }
          
          setVideoUrl(url);
          setShowVrViewer(true);
        } else {
          // For non-video URLs, offer to open externally
          setResult(url);
          setQrDetected(true);
          console.log("Non-video URL detected:", url);
        }
      } else {
        console.log("Non-URL text detected:", url);
        // If not a URL, just display the result as text
        setQrDetected(true);
      }
    } catch (err) {
      console.error('Error processing QR result:', err);
      setError(`Error processing QR code: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Check if string is a valid URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  };
  
  // Check if URL is likely a video
  const isVideoUrl = (url) => {
    // Common video extensions and domains
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const videoDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'twitch.tv'];
    
    try {
      const urlObj = new URL(url);
      
      // Check if domain is a known video platform
      if (videoDomains.some(domain => urlObj.hostname.includes(domain))) {
        return true;
      }
      
      // Check if URL ends with a video extension
      if (videoExtensions.some(ext => urlObj.pathname.toLowerCase().endsWith(ext))) {
        return true;
      }
      
      // If S3 URL with MP4, definitely a video
      if (url.includes('s3.') && url.endsWith('.mp4')) {
        return true;
      }
      
      return false;
    } catch (err) {
      return false;
    }
  };

  // Open URL externally
  const openExternalUrl = () => {
    if (result) {
      window.open(result, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle video element error
  const handleVideoError = (event) => {
    console.error("Video error:", event);
    setCorsError(true);
    // Switch to simple player on video error
    switchToSimplePlayer();
  };
  
  // Function to try different methods of loading the video
  const tryLoadingWithVariousApproaches = (videoEl) => {
    if (!videoEl) return;
    
    console.log("Trying multiple approaches to load the video");
    
    // Add error listener
    videoEl.addEventListener('error', handleVideoError);
    
    // Try direct approach first (for properly configured S3 buckets)
    try {
      console.log("Approach 1: Direct loading with CORS headers");
      setupDirectVideoElement(videoEl, videoUrl);
      
      // Then try with a proxied URL if we have it
      setTimeout(() => {
        if (videoEl.networkState === 3 && proxyUrl) { // NETWORK_NO_SOURCE
          console.log("Direct loading failed, trying proxy approach");
          setupCorsVideoElement(videoEl, videoUrl);
        }
      }, 3000);
    } catch (e) {
      console.error("Error setting up video element:", e);
      if (proxyUrl) {
        setupCorsVideoElement(videoEl, videoUrl);
      }
    }
  };

  // Once the Aframe scene has loaded
  const handleSceneLoaded = () => {
    setLoading(false);
    console.log("VR Scene loaded");
    
    // Properly handle video playback
    setTimeout(() => {
      const videoEl = document.getElementById('vr-video');
      if (videoEl) {
        // Try multiple approaches for loading the video
        tryLoadingWithVariousApproaches(videoEl);
        
        // Try playing the video with user interaction fallback
        videoEl.play().catch(err => {
          console.warn("Could not autoplay video:", err);
          // We'll rely on user interaction through the play button
        });
      }
    }, 1000);
  };
  
  // Switch to simple player view
  const switchToSimplePlayer = () => {
    setUseSimplePlayer(true);
    setLoading(false);
  };
  
  // Go back to scan another QR code
  const goBackToScanner = () => {
    setShowVrViewer(false);
    setVideoUrl(null);
    setQrDetected(false);
    resetScanner();
  };

  return (
    <div className="qr-scanner-container">
      {!showVrViewer ? (
        <Card className="mb-4">
          <Card.Header>
            <h3 className="mb-0">QR Code Scanner</h3>
          </Card.Header>
          <Card.Body>
            {/* HTML5 QR Scanner container */}
            <div id="qr-reader" ref={qrReaderDivRef} style={{ display: cameraActive && !qrDetected ? 'block' : 'none', width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
            
            {/* Camera toggle button */}
            {!cameraActive && !qrDetected && (
              <div className="text-center mb-4">
                <Button 
                  variant="primary" 
                  onClick={() => setCameraActive(true)}
                  className="mb-3"
                >
                  Start Camera
                </Button>
                <p className="text-muted">Click to activate your camera and scan a QR code.</p>
              </div>
            )}
            
            {/* Camera error message */}
            {cameraError && (
              <Alert variant="danger" className="mb-3">
                <Alert.Heading>Camera Error</Alert.Heading>
                <p>{cameraError}</p>
                <Button variant="outline-danger" size="sm" onClick={() => setCameraActive(true)}>
                  Try Again
                </Button>
              </Alert>
            )}
            
            {/* Video display when camera is active (Legacy approach) */}
            {cameraActive && !qrDetected && !html5QrScannerRef.current && (
              <div className="qr-scanner-preview mb-3 position-relative">
                {/* Visible video preview */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-100 border rounded"
                  style={{ maxHeight: '50vh', backgroundColor: '#000' }} 
                />
                
                {/* Canvas overlay for QR detection */}
                <canvas 
                  ref={canvasRef}
                  className="position-absolute top-0 start-0 w-100 h-100" 
                  style={{ display: 'none' }} 
                />
                
                {/* QR code scan target overlay */}
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center pointer-events-none">
                  <div 
                    style={{ 
                      border: '2px dashed rgba(255, 255, 255, 0.5)', 
                      width: '80%', 
                      height: '80%', 
                      maxWidth: '300px',
                      maxHeight: '300px',
                      borderRadius: '20px'
                    }} 
                  />
                </div>
                
                {/* Scanning indicator */}
                {scanningActive && (
                  <div className="position-absolute top-0 start-0 w-100 p-2 bg-dark bg-opacity-25 text-white">
                    <div className="d-flex align-items-center">
                      <Spinner 
                        animation="border" 
                        size="sm" 
                        variant="light" 
                        className="me-2" 
                      />
                      <small>
                        Scanning for QR code...
                        {scanAttempts > 10 && " Center the code in the viewfinder."}
                        {scanAttempts > 20 && " Make sure the QR code is well-lit and clearly visible."}
                      </small>
                    </div>
                  </div>
                )}
                
                {/* Stop scanning button */}
                <Button 
                  variant="light" 
                  size="sm" 
                  className="position-absolute bottom-0 end-0 m-2"
                  onClick={() => setCameraActive(false)}
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* QR Result display when not a video URL */}
            {qrDetected && !showVrViewer && (
              <div className="mt-3">
                <Alert variant={isValidUrl(result) ? "info" : "success"}>
                  <Alert.Heading>QR Code Detected</Alert.Heading>
                  <p className="mb-0">
                    <strong>Content:</strong> {result}
                  </p>
                </Alert>
                {isValidUrl(result) && (
                  <div className="d-flex justify-content-end mt-2">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={openExternalUrl}
                      className="me-2"
                    >
                      Open URL
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={resetScanner}
                    >
                      Scan Another QR Code
                    </Button>
                  </div>
                )}
                {!isValidUrl(result) && (
                  <div className="d-flex justify-content-end mt-2">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={resetScanner}
                    >
                      Scan Another QR Code
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Error message */}
            {error && (
              <Alert variant="danger" className="mb-3">
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
                <div className="mt-2">
                  <Button variant="outline-danger" size="sm" onClick={resetScanner}>
                    Try Again
                  </Button>
                </div>
              </Alert>
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="text-center p-4">
                <Spinner animation="border" variant="primary" className="mb-2" />
                <p>Processing QR code...</p>
              </div>
            )}
          </Card.Body>
        </Card>
      ) : (
        /* Embedded VR Viewer */
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">VR Viewer</h3>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={goBackToScanner}
            >
              Back to Scanner
            </Button>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="d-flex flex-column justify-content-center align-items-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 mb-4">Loading video...</p>
                <Button variant="secondary" onClick={switchToSimplePlayer}>
                  Switch to Simple Player
                </Button>
              </div>
            ) : useSimplePlayer ? (
              /* Simple Video Player View */
              <div className="video-container" style={{ height: '70vh' }}>
                {corsError && (
                  <Alert variant="warning" className="mb-2">
                    <Alert.Heading>CORS Access Issue</Alert.Heading>
                    <p>
                      The video cannot be accessed due to cross-origin restrictions.
                      The S3 bucket needs to be configured to allow access from this website.
                    </p>
                  </Alert>
                )}
                <ReactPlayer
                  url={videoUrl}  // Use direct URL for ReactPlayer
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
                    setCorsError(true);
                  }}
                />
              </div>
            ) : (
              /* VR Scene for 360 Video */
              <div className="position-relative" style={{ height: '70vh' }}>
                {/* Simple mode button */}
                <div className="position-absolute top-0 end-0 p-2 z-index-1">
                  <Button variant="light" size="sm" onClick={switchToSimplePlayer}>
                    Standard Player
                  </Button>
                </div>
                
                {/* A-Frame scene */}
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
                        onError={handleVideoError}  // Add error handler
                      ></video>
                    </a-assets>
                    
                    <a-videosphere 
                      src="#vr-video"
                      rotation="0 -90 0"
                    ></a-videosphere>
                    
                    <a-camera position="0 1.6 0" wasd-controls-enabled="false">
                      <a-cursor color="#FFFFFF"></a-cursor>
                    </a-camera>
                    
                    {/* Floating play button */}
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
                            video.play().catch(e => {
                              console.error("Error playing video:", e);
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
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default QRScanner;