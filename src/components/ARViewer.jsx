import React, { useEffect, useRef, useState } from 'react';
import { Button, Spinner, Alert, Overlay, Tooltip } from 'react-bootstrap';
import { XCircle, ArrowsAngleExpand, ArrowsAngleContract, InfoCircle, HandIndex } from 'react-bootstrap-icons';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';

const ARViewer = ({ modelUrl, markerUrl, onClose }) => {
  const containerRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isARMode, setIsARMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const infoButtonRef = useRef(null);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  useEffect(() => {
    // Check if modelUrl is provided
    if (!modelUrl) {
      setError('No 3D model URL provided. Please provide a valid model URL.');
      setIsLoading(false);
      return;
    }

    let camera, scene, renderer, model;
    let controller, controllerGrip;
    let reticle;
    let mixer;
    let clock;
    let isARSupported = false;

    const init = async () => {
      try {
        // Check for AR support
        if ('xr' in navigator) {
          isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
        }
        
        setLoadingMessage('Setting up 3D environment...');
        setLoadingProgress(20);

        // Scene setup
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0.5, 1, 0.5);
        scene.add(directionalLight);

        // Reticle for AR
        reticle = new THREE.Mesh(
          new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial()
        );
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(reticle);
        
        setLoadingMessage('Loading 3D model...');
        setLoadingProgress(40);

        // Load 3D model with progress tracking
        const loader = new GLTFLoader();
        loader.load(
          modelUrl, 
          (gltf) => {
            setLoadingMessage('Processing 3D model...');
            setLoadingProgress(80);
            
            model = gltf.scene;
            scene.add(model);

            // Center and scale model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1 / maxDim;
            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            
            // Position model slightly in front of camera for better initial view
            model.position.z = -0.5;

            // Animation mixer for model animations
            mixer = new THREE.AnimationMixer(model);
            if (gltf.animations.length) {
              const action = mixer.clipAction(gltf.animations[0]);
              action.play();
            }
            
            // Setup controllers
            controller = renderer.xr.getController(0);
            controllerGrip = renderer.xr.getControllerGrip(0);
            scene.add(controller);
            scene.add(controllerGrip);

            // Add event listeners
            controller.addEventListener('select', onSelect);
            window.addEventListener('resize', onWindowResize, false);

            // Start animation loop
            clock = new THREE.Clock();
            renderer.setAnimationLoop(render);

            setLoadingMessage('Finalizing AR setup...');
            setLoadingProgress(90);
            
            // Create AR/VR buttons
            try {
              if (isARSupported) {
                const arButton = ARButton.createButton(renderer, {
                  requiredFeatures: ['hit-test'],
                  optionalFeatures: ['dom-overlay'],
                  domOverlay: { root: document.body }
                });
                
                // Style the AR button
                arButton.style.padding = '10px 20px';
                arButton.style.margin = '10px auto';
                arButton.style.display = 'block';
                arButton.style.backgroundColor = '#007bff';
                arButton.style.color = 'white';
                arButton.style.border = 'none';
                arButton.style.borderRadius = '5px';
                arButton.style.fontSize = '16px';
                
                document.body.appendChild(arButton);
                setIsARMode(true);
              } else {
                // Create a fallback VR button (or you could show an error)
                const vrButton = VRButton.createButton(renderer);
                document.body.appendChild(vrButton);
              }
            } catch (buttonErr) {
              console.error('Error creating AR/VR buttons:', buttonErr);
              // Show a fallback message but don't fail the entire component
            }
            
            setLoadingProgress(100);
            setIsLoading(false);
          },
          // Progress callback
          (progress) => {
            if (progress.lengthComputable) {
              const progressValue = Math.round((progress.loaded / progress.total) * 30) + 40;
              setLoadingProgress(progressValue);
              setLoadingMessage(`Loading 3D model... ${progressValue}%`);
            }
          },
          // Error callback
          (err) => {
            console.error('Error loading model:', err);
            setError(`Failed to load 3D model: ${err.message || 'Unknown error'}`);
            setIsLoading(false);
          }
        );
        
      } catch (err) {
        console.error('Error initializing AR:', err);
        setError(`Failed to initialize AR experience: ${err.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    const onSelect = () => {
      if (reticle.visible) {
        model.position.copy(reticle.position);
        model.visible = true;
      }
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const render = () => {
      if (mixer) {
        mixer.update(clock.getDelta());
      }

      if (controller) {
        reticle.visible = false;
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        reticle.quaternion.setFromRotationMatrix(tempMatrix);

        const hasHitTestSource = controller.userData.hasOwnProperty('hitTestSource') &&
                               controller.userData.hitTestSource !== null;
                               
        if (hasHitTestSource) {
          // Update reticle position
          const hitTestResults = renderer.xr.getSession().getHitTestResults(controller.userData.hitTestSource);
          if (hitTestResults.length) {
            const hit = hitTestResults[0];
            reticle.visible = true;
            reticle.matrix.fromArray(hit.getPose(renderer.xr.getReferenceSpace()).transform.matrix);
          }
        } else {
          // Fallback using raycasting for non-hit-test environments
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(new THREE.Vector2(), camera);
          const intersects = raycaster.intersectObjects(scene.children, true);
          
          if (intersects.length > 0) {
            const intersection = intersects[0];
            reticle.position.copy(intersection.point);
            reticle.visible = true;
          }
        }
      }

      renderer.render(scene, camera);
    };

    init();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      renderer?.setAnimationLoop(null);
      renderer?.dispose();
      containerRef.current?.removeChild(renderer?.domElement);
      
      // Remove AR/VR buttons
      document.querySelectorAll('.ar-button, .vr-button').forEach(btn => btn.remove());
    };
  }, [modelUrl]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleExitAR = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    onClose?.();
  };

  // Auto-hide instructions after 10 seconds
  useEffect(() => {
    if (showInstructions) {
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showInstructions]);

  if (isLoading) {
    return (
      <div className="ar-loading text-center p-4">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading AR experience...</span>
        </Spinner>
        <p className="mt-3">{loadingMessage}</p>
        <div className="progress mt-2 mb-4" style={{ height: '10px' }}>
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: `${loadingProgress}%` }}
            aria-valuenow={loadingProgress}
            aria-valuemin="0" 
            aria-valuemax="100"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ar-error p-3">
        <Alert variant="danger">{error}</Alert>
        <div className="d-grid gap-2">
          <Button variant="outline-secondary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
          {onClose && (
            <Button variant="primary" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ar-viewer">
      <div 
        ref={containerRef} 
        className="ar-container" 
        style={{ width: '100%', height: '60vh', backgroundColor: '#f0f0f0' }}
      />
      
      <div className="ar-controls mt-3 mb-3 d-flex justify-content-between">
        <Button 
          variant="outline-secondary"
          size="sm"
          ref={infoButtonRef}
          onClick={() => setShowInfoTooltip(!showInfoTooltip)}
          className="me-2"
        >
          <InfoCircle size={18} />
        </Button>
        
        <Button 
          variant="outline-primary"
          size="sm"
          onClick={toggleFullscreen}
          className="me-2"
        >
          {isFullscreen ? <ArrowsAngleContract size={18} /> : <ArrowsAngleExpand size={18} />}
        </Button>
        
        {onClose && (
          <Button 
            variant="outline-danger"
            size="sm"
            onClick={handleExitAR}
          >
            <XCircle size={18} />
          </Button>
        )}
      </div>
      
      <Overlay target={infoButtonRef.current} show={showInfoTooltip} placement="top">
        <Tooltip id="ar-info-tooltip">
          <div className="text-start">
            <p className="mb-2"><strong>AR Controls</strong></p>
            <ul className="ps-3 mb-0">
              <li>Click "Start AR" to begin</li>
              <li>Move your device to scan surfaces</li>
              <li>Tap on a surface to place the model</li>
              <li>Pinch to scale the model</li>
              <li>Use two fingers to rotate</li>
            </ul>
          </div>
        </Tooltip>
      </Overlay>
      
      {/* Instructions Overlay */}
      {showInstructions && (
        <Alert variant="info" className="mt-3" dismissible onClose={() => setShowInstructions(false)}>
          <Alert.Heading className="h5">How to Use AR Viewer</Alert.Heading>
          <ol className="mb-0">
            <li>Click the "Start AR" button to begin the AR experience</li>
            <li>Move your device to scan nearby surfaces</li>
            <li>Once a surface is detected (look for the circle indicator), tap to place the model</li>
            <li>Use pinch gestures to resize the model</li>
          </ol>
        </Alert>
      )}
    </div>
  );
};

// Set default props
ARViewer.defaultProps = {
  onClose: null,
  markerUrl: null
};

export default ARViewer;