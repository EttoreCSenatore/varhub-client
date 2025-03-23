import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { Html5Qrcode } from 'html5-qrcode';
import { Spinner, Alert, Button, Card } from 'react-bootstrap';
import ReactPlayer from 'react-player';

const QRScanner = () => {
  // State for QR scanning
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
    setError(null);
    setScanAttempts(0);
    setQrDetected(false);
    setCameraActive(true);
  };

  // Process QR code result (URL)
  const processQrCodeResult = (url) => {
    setLoading(true);
    setError(null);

    try {
      // Basic validation to check if it's a URL
      if (isValidUrl(url)) {
        console.log("Valid URL detected:", url);
        // Open the URL directly
        window.location.href = url;
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

  // Open URL externally
  const openExternalUrl = () => {
    if (result) {
      window.open(result, '_blank', 'noopener,noreferrer');
    }
  };

  // Check if running on mobile device
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  return (
    <div className="qr-scanner-container">
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

          {/* QR Result display when not a URL */}
          {qrDetected && !isValidUrl(result) && (
            <div className="mt-3">
              <Alert variant="success">
                <Alert.Heading>QR Code Detected</Alert.Heading>
                <p className="mb-0">
                  <strong>Content:</strong> {result}
                </p>
              </Alert>
              <div className="d-flex justify-content-end mt-3">
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={resetScanner}
                >
                  Scan Another Code
                </Button>
              </div>
            </div>
          )}

          {/* Error with external URL option */}
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
    </div>
  );
};

export default QRScanner;