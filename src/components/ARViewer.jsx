import React, { useEffect, useRef, useState } from 'react';
import { Button, Spinner, Alert, Overlay, Tooltip } from 'react-bootstrap';
import { XCircle, ArrowsAngleExpand, ArrowsAngleContract, InfoCircle, HandIndex } from 'react-bootstrap-icons';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';

const ARViewer = ({ modelUrl, onClose }) => {
  const containerRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isARMode, setIsARMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const infoButtonRef = useRef(null);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  useEffect(() => {
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

        // Scene setup
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        // Lighting
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        light.position.set(0.5, 1, 0.25);
        scene.add(light);

        // Reticle for AR
        reticle = new THREE.Mesh(
          new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial()
        );
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(reticle);

        // Load 3D model
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(modelUrl);
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

        // Setup controllers
        controller = renderer.xr.getController(0);
        controllerGrip = renderer.xr.getControllerGrip(0);
        scene.add(controller);
        scene.add(controllerGrip);

        // Add event listeners
        controller.addEventListener('select', onSelect);
        window.addEventListener('resize', onWindowResize, false);

        // Animation mixer for model animations
        mixer = new THREE.AnimationMixer(model);
        if (gltf.animations.length) {
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        // Start animation loop
        clock = new THREE.Clock();
        renderer.setAnimationLoop(render);

        // Show AR/VR button if supported
        if (isARSupported) {
          const arButton = ARButton.createButton(renderer, {
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay'],
            domOverlay: { root: document.body }
          });
          document.body.appendChild(arButton);
          setIsARMode(true);
        } else {
          const vrButton = VRButton.createButton(renderer);
          document.body.appendChild(vrButton);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing AR:', err);
        setError('Failed to initialize AR experience');
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

        controller.getObjectByName('line').visible = true;
        const intersections = [];

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(), camera);

        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
          const intersection = intersects[0];
          intersection.object.material.emissive?.setHex(0x666666);
          intersections.push(intersection);

          reticle.position.copy(intersection.point);
          reticle.visible = true;
        }

        intersects.forEach((intersection) => {
          intersection.object.material.emissive?.setHex(0x000000);
        });
      }

      renderer.render(scene, camera);
    };

    init();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      renderer.setAnimationLoop(null);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
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
    onClose();
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
      <div className="ar-loading">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading AR experience...</span>
        </Spinner>
        <p className="mt-3">Loading AR experience...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ar-error">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={onClose} className="mt-3">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="ar-viewer">
      <div ref={containerRef} className="ar-container" />
      
      {/* Instructions Overlay */}
      {showInstructions && (
        <div className="instructions-overlay">
          <div className="instructions-card">
            <h4>Welcome to AR Viewer</h4>
            <div className="instruction-item">
              <div className="instruction-icon">
                <HandIndex size={24} />
              </div>
              <p>Tap the "Start AR" button to begin the AR experience</p>
            </div>
            
            <div className="instruction-item">
              <div className="instruction-icon">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z" />
                </svg>
              </div>
              <p>Move your device around to scan surfaces</p>
            </div>
            
            <div className="instruction-item">
              <div className="instruction-icon">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M8,14V18L2,12L8,6V10H16V6L22,12L16,18V14H8Z" />
                </svg>
              </div>
              <p>Tap to place the 3D model on detected surfaces</p>
            </div>
            
            <div className="instruction-item">
              <div className="instruction-icon">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,12.5A1.5,1.5 0 0,1 10.5,11A1.5,1.5 0 0,1 12,9.5A1.5,1.5 0 0,1 13.5,11A1.5,1.5 0 0,1 12,12.5M12,7.2C9.9,7.2 8.2,8.9 8.2,11C8.2,14 12,17.5 12,17.5C12,17.5 15.8,14 15.8,11C15.8,8.9 14.1,7.2 12,7.2Z" />
                </svg>
              </div>
              <p>Use pinch gestures to resize the model</p>
            </div>
            
            <Button 
              variant="primary" 
              className="mt-3" 
              onClick={() => setShowInstructions(false)}
            >
              Got it!
            </Button>
          </div>
        </div>
      )}

      <div className="ar-controls">
        <Button
          variant="light"
          className="ar-button info-button"
          ref={infoButtonRef}
          onClick={() => setShowInfoTooltip(!showInfoTooltip)}
        >
          <InfoCircle size={24} />
        </Button>
        
        <Overlay target={infoButtonRef.current} show={showInfoTooltip} placement="bottom">
          {(props) => (
            <Tooltip id="info-tooltip" {...props} className="info-tooltip">
              <Button 
                variant="link" 
                className="p-0 text-white mb-2" 
                onClick={() => {
                  setShowInstructions(true);
                  setShowInfoTooltip(false);
                }}
              >
                Show instructions
              </Button>
            </Tooltip>
          )}
        </Overlay>
        
        <Button
          variant="light"
          className="ar-button fullscreen-button"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <ArrowsAngleContract size={24} /> : <ArrowsAngleExpand size={24} />}
        </Button>
        
        <Button
          variant="light"
          className="ar-button exit-button"
          onClick={handleExitAR}
        >
          <XCircle size={24} />
        </Button>
      </div>

      <style jsx>{`
        .ar-viewer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .ar-container {
          flex: 1;
          width: 100%;
          height: 100%;
          position: relative;
        }

        .ar-controls {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 10px;
          z-index: 1001;
        }

        .ar-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }

        .ar-button:hover {
          background: white;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .instructions-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1002;
          padding: 20px;
        }

        .instructions-card {
          background: white;
          border-radius: 10px;
          padding: 24px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .instructions-card h4 {
          text-align: center;
          margin-bottom: 20px;
          color: #0d6efd;
        }

        .instruction-item {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }

        .instruction-icon {
          width: 40px;
          height: 40px;
          background: #f0f8ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          color: #0d6efd;
          flex-shrink: 0;
        }

        .instruction-item p {
          margin: 0;
          line-height: 1.4;
        }

        .info-tooltip {
          background: rgba(0, 0, 0, 0.8) !important;
          padding: 10px !important;
        }

        .ar-loading {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          z-index: 1000;
        }

        .ar-error {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.8);
          padding: 20px;
          z-index: 1000;
        }

        :global(canvas) {
          width: 100% !important;
          height: 100% !important;
        }

        @media (max-width: 576px) {
          .ar-controls {
            top: 10px;
            right: 10px;
          }
          .ar-button {
            width: 40px;
            height: 40px;
          }
          .instructions-card {
            padding: 20px;
            margin: 10px;
          }
          /* ... more mobile optimizations ... */
        }
      `}</style>
    </div>
  );
};

export default ARViewer;