import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsQR from 'jsqr';
import ARViewer from './ARViewer';
import { Spinner, Alert, Button, Card } from 'react-bootstrap';

const QRScanner = () => {
  // State for QR scanning and project data
  const [result, setResult] = useState('');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for camera controls
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanningActive, setScanningActive] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  
  // Refs for video and canvas elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scannerIntervalRef = useRef(null);
  const streamRef = useRef(null);

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
      
      // Try different camera constraints to improve compatibility
      let stream;
      
      try {
        // First try to get environment-facing camera (back camera)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (initialError) {
        console.log('Could not access environment camera, trying default camera', initialError);
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error("Video play error:", e));
          setScanningActive(true);
          startScanning();
        };
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

  // Stop camera function
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current);
      scannerIntervalRef.current = null;
    }
    
    setScanningActive(false);
  };
  
  // Start QR scanning with improved performance
  const startScanning = () => {
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current);
    }
    
    // Use requestAnimationFrame for better performance
    const scan = () => {
      processFrame();
      
      // Only continue scanning if active
      if (scanningActive && !result) {
        // Increment scan attempts to give some feedback about ongoing scanning
        setScanAttempts(prev => prev + 1);
        scannerIntervalRef.current = requestAnimationFrame(scan);
      }
    };
    
    // Start the scanning loop
    scannerIntervalRef.current = requestAnimationFrame(scan);
  };

  // Process video frame to detect QR code with improved algorithm
  const processFrame = () => {
    if (!videoRef.current || !canvasRef.current || !scanningActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
    
    // Get video dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    // Match canvas dimensions to video
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      // Get center portion of the image for faster processing
      // Using the middle 50% of the image where QR codes are most likely to be
      const centerWidth = Math.floor(videoWidth * 0.5);
      const centerHeight = Math.floor(videoHeight * 0.5);
      const startX = Math.floor((videoWidth - centerWidth) / 2);
      const startY = Math.floor((videoHeight - centerHeight) / 2);
      
      // Draw scanning region indicator
      context.strokeStyle = "#00FF00";
      context.lineWidth = 3;
      context.strokeRect(startX, startY, centerWidth, centerHeight);
      
      // Get image data from the center region
      const imageData = context.getImageData(startX, startY, centerWidth, centerHeight);
      
      // Process with jsQR
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert" // Try to improve performance
      });
      
      if (qrCode) {
        // QR code detected!
        console.log("QR Code detected:", qrCode.data);
        
        // Adjust the location coordinates to match the full image
        const adjustedLocation = {
          topLeftCorner: { 
            x: qrCode.location.topLeftCorner.x + startX, 
            y: qrCode.location.topLeftCorner.y + startY 
          },
          topRightCorner: { 
            x: qrCode.location.topRightCorner.x + startX, 
            y: qrCode.location.topRightCorner.y + startY 
          },
          bottomRightCorner: { 
            x: qrCode.location.bottomRightCorner.x + startX, 
            y: qrCode.location.bottomRightCorner.y + startY 
          },
          bottomLeftCorner: { 
            x: qrCode.location.bottomLeftCorner.x + startX, 
            y: qrCode.location.bottomLeftCorner.y + startY 
          }
        };
        
        // Draw QR code location on canvas for visual feedback
        drawQRCodeHighlight(context, adjustedLocation);
        
        // Play success sound if available
        try {
          const successSound = new Audio('/qr-success.mp3');
          successSound.play();
        } catch (soundError) {
          console.log('Could not play sound', soundError);
        }
        
        // Call our handler function instead of just setting the result
        handleQRCodeDetected(qrCode.data);
        
        // Stop scanning once a QR code is found
        clearInterval(scannerIntervalRef.current);
        setScanningActive(false);
      }
    } catch (err) {
      console.error('QR scan error:', err);
      // Don't show the error to user on every frame
      if (scanAttempts % 50 === 0) {
        setError(`QR scanning issue: ${err.message || 'Failed to process image'}`);
      }
    }
  };
  
  // Draw a highlight around the detected QR code
  const drawQRCodeHighlight = (context, location) => {
    context.lineWidth = 6;
    context.strokeStyle = "#FF3B58";
    
    context.beginPath();
    context.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
    context.lineTo(location.topRightCorner.x, location.topRightCorner.y);
    context.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
    context.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
    context.lineTo(location.topLeftCorner.x, location.topLeftCorner.y);
    context.stroke();
    
    // Add "QR Detected" text
    context.fillStyle = "#FF3B58";
    context.font = "24px Arial";
    context.fillText("QR Code Detected!", 20, 40);
  };
  
  // Reset scanner to try again
  const resetScanner = () => {
    setResult('');
    setProject(null);
    setError(null);
    setScanAttempts(0);
    setCameraActive(true);
  };

  // Mock function for testing without a server
  const useMockProject = () => {
    const mockProject = {
      id: "mock-123",
      name: "Sample AR Project",
      description: "This is a sample AR project for testing",
      model_3d_url: "https://cdn.aframe.io/examples/models/duck/duck.gltf",
      marker_image_url: "https://raw.githubusercontent.com/AR-js-org/AR.js/master/three.js/examples/marker-training/examples/pattern-files/pattern-hiro.png"
    };
    
    setProject(mockProject);
    setLoading(false);
  };

  // Function to handle QR code detection and fetch project data
  const handleQRCodeDetected = (qrCodeData) => {
    setScanningActive(false);
    setResult(qrCodeData);
    console.log('QR Code detected:', qrCodeData);
    
    // Special case for test QR code
    if (qrCodeData === 'mock-test') {
      const mockProject = {
        id: 'test-project-123',
        name: 'Demo Project',
        description: 'This is a demo project created from scanning the test QR code',
        image_url: 'https://via.placeholder.com/300x200?text=Demo+Project',
        model_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf',
        vr_video_url: 'https://bitmovin-a.akamaihd.net/content/playhouse-vr/m3u8s/stereo/caminandes_vr_720p_3.5mb.m3u8',
        qr_code: 'mock-test',
        created_at: new Date().toISOString(),
      };
      
      setProject(mockProject);
      setLoading(false);
      return;
    }
    
    // For mock project testing
    if (qrCodeData.startsWith("mock")) {
      setTimeout(useMockProject, 1000); // Simulate network delay
      return;
    }
    
    // For actual project IDs, fetch from the API
    fetchProject(qrCodeData);
  };

  const fetchProject = async (projectId) => {
    // For test QR code we handle it in handleQRCodeDetected
    if (projectId === 'mock-test' || projectId.startsWith("mock")) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      
      if (error.response) {
        // Handle different HTTP error responses
        if (error.response.status === 404) {
          setError('Project not found. The QR code may be invalid or outdated.');
        } else {
          setError(`Server error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        // Network error
        setError('Network error: Could not connect to the server. Please check your internet connection.');
        
        // Provide a way to still demo the app when offline
        const shouldUseMock = window.confirm('Server connection failed. Would you like to load sample data for testing?');
        if (shouldUseMock) {
          useMockProject();
          return;
        }
      } else {
        setError(`Error: ${error.message || 'Unknown error occurred'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qr-scanner-container">
      {!project ? (
        <>
          {/* Camera toggle button */}
          {!cameraActive && !result && (
            <div className="text-center mb-4">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setCameraActive(true)}
                className="mb-3"
              >
                Start Camera
              </Button>
              <p className="text-muted">Click to activate your camera and scan a QR code.</p>
              <div className="mt-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    handleQRCodeDetected("mock-test");
                  }}
                >
                  Test with Sample QR (Demo Only)
                </Button>
              </div>
            </div>
          )}
          
          {/* Camera error message */}
          {cameraError && (
            <Alert variant="danger" className="mb-3">
              <Alert.Heading>Camera Error</Alert.Heading>
              <p>{cameraError}</p>
              <hr />
              <div className="d-flex justify-content-between">
                <Button variant="outline-danger" size="sm" onClick={() => setCameraActive(true)}>
                  Try Again
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => {
                    handleQRCodeDetected("mock-test");
                  }}
                >
                  Continue with Sample Data
                </Button>
              </div>
            </Alert>
          )}
          
          {/* Video display when camera is active */}
          {cameraActive && !result && (
            <div className="qr-scanner-preview mb-3 position-relative">
              {/* Visible video preview */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-100 border rounded"
                style={{ maxHeight: '60vh', backgroundColor: '#000' }} 
              />
              
              {/* Canvas for processing and display */}
              <canvas 
                ref={canvasRef} 
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{ zIndex: 10 }}
              />
              
              {/* Scanning indicator */}
              {scanningActive && (
                <div className="position-absolute top-0 start-0 w-100 p-2 bg-dark bg-opacity-25 text-white d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <span>Scanning for QR Code... {scanAttempts > 0 ? `(${scanAttempts} scans)` : ''}</span>
                  </div>
                  <Button 
                    variant="outline-light" 
                    size="sm"
                    onClick={() => stopCamera()}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* General error message */}
          {error && !cameraError && (
            <Alert variant="danger" className="mb-3">
              <p className="mb-2">{error}</p>
              <Button variant="outline-primary" size="sm" onClick={resetScanner}>
                Try Again
              </Button>
            </Alert>
          )}
          
          {/* Loading indicator when fetching project */}
          {loading && (
            <div className="text-center p-4">
              <Spinner animation="border" className="mb-3" />
              <p>Loading project data...</p>
            </div>
          )}
          
          {/* Instructions */}
          {cameraActive && !result && !error && (
            <Alert variant="info" className="mt-3">
              <strong>Tips for scanning:</strong>
              <ul className="mb-0 mt-2">
                <li>Make sure your QR code is well-lit and clearly visible</li>
                <li>Hold your device steady and center the QR code in the frame</li>
                <li>Move closer if the code is too small, but keep the entire code visible</li>
                <li>Clean your camera lens if the image appears blurry</li>
              </ul>
            </Alert>
          )}
        </>
      ) : (
        <div className="project-result">
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="h4 mb-0">{project.name}</h3>
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={resetScanner}
                >
                  Scan Another
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">{project.description}</p>
              
              {/* Project Image if available */}
              {project.image_url && (
                <div className="text-center mb-4">
                  <img 
                    src={project.image_url} 
                    alt={project.name} 
                    className="img-fluid rounded" 
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
              
              {/* Tabs for AR/VR content */}
              <div className="d-flex justify-content-around mb-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100 me-2"
                  disabled={!project.model_url && !project.model_3d_url}
                  onClick={() => window.location.href = `/ar-viewer/${project.id}`}
                >
                  <i className="fas fa-cube me-2"></i>
                  View in AR
                </Button>
                
                <Button 
                  variant="success" 
                  size="lg" 
                  className="w-100 ms-2"
                  disabled={!project.vr_video_url}
                  onClick={() => window.location.href = `/vr-viewer/${project.id}`}
                >
                  <i className="fas fa-vr-cardboard me-2"></i>
                  View in VR
                </Button>
              </div>
              
              {/* AR Viewer Component */}
              {project.model_url && (
                <div className="mb-4">
                  <h4 className="mb-3">AR Preview</h4>
                  <ARViewer 
                    modelUrl={project.model_url || project.model_3d_url} 
                    markerUrl={project.marker_image_url || null}
                  />
                </div>
              )}

              {/* VR Video URL if available */}
              {project.vr_video_url && (
                <div className="mt-4">
                  <h4 className="mb-2">VR Experience Available</h4>
                  <p className="text-muted">
                    This project includes a VR video experience. Click the "View in VR" button to access the full immersive content.
                  </p>
                </div>
              )}
              
              {/* Project Metadata */}
              <div className="mt-4 pt-3 border-top">
                <small className="text-muted">
                  Project ID: {project.id}<br />
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </small>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QRScanner;