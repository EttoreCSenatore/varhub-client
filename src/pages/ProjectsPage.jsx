import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { Container, Row, Col, Card, Button, Spinner, ButtonGroup, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

// Use lazy loading for ReactPlayer to prevent 404 errors with chunked files
const ReactPlayer = lazy(() => import('react-player/lazy'));

// Custom placeholder image paths for different project types
const PLACEHOLDER_IMAGES = {
  VR: '/images/vr-placeholder.svg',
  AR: '/images/ar-placeholder.svg',
  '360': '/images/360-video-placeholder.svg',
  HIT_TEST: '/images/hit-test-placeholder.svg', 
  ANCHORS: '/images/anchors-placeholder.svg',
  HANDS: '/images/hands-placeholder.svg',
  DEFAULT: '/images/placeholder.svg'
};

// WebXR Polyfill script
const loadWebXRPolyfill = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/webxr-polyfill@latest/build/webxr-polyfill.js';
    script.async = true;
    script.onload = () => {
      // Initialize the polyfill after loading
      if (window.WebXRPolyfill) {
        new window.WebXRPolyfill();
        console.log('WebXR Polyfill loaded and initialized');
      }
      resolve();
    };
    script.onerror = () => {
      console.error('Failed to load WebXR Polyfill');
      reject();
    };
    document.head.appendChild(script);
  });
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const polyfillLoaded = useRef(false);

  useEffect(() => {
    // Load WebXR polyfill when the component mounts
    if (!polyfillLoaded.current) {
      loadWebXRPolyfill()
        .then(() => {
          polyfillLoaded.current = true;
        })
        .catch(error => {
          console.error('Error loading WebXR polyfill:', error);
        });
    }

    const fetchProjects = async () => {
      try {
        // Base path for official WebXR samples
        const webXRBasePath = "https://immersive-web.github.io/webxr-samples/";
        
        // Demo projects
        const demoProjects = [
          {
            id: "vr-house-tour",
            title: "VR House Tour",
            description: "Experience a virtual reality tour of a modern house in 360°",
            thumbnail: PLACEHOLDER_IMAGES['360'],
            videoUrl: "https://varhub-videos.s3.us-east-2.amazonaws.com/project-alpha-360.mp4",
            type: "360-video",
            createdAt: new Date().toISOString()
          },
          {
            id: "immersive-ar-session",
            title: "Immersive AR Session",
            description: "Demonstrates how to use an 'immersive-ar' XRSession to present a simple WebGL scene to a transparent or passthrough XR device.",
            thumbnail: PLACEHOLDER_IMAGES.AR,
            pagePath: webXRBasePath + "immersive-ar-session.html",
            type: "ar-experience",
            createdAt: new Date().toISOString()
          },
          {
            id: "immersive-vr-session",
            title: "Immersive VR Session",
            description: "Demonstrates how to use an 'immersive-vr' XRSession to present a simple WebGL scene to an XR device.",
            thumbnail: PLACEHOLDER_IMAGES.VR,
            pagePath: webXRBasePath + "immersive-vr-session.html",
            type: "vr-experience",
            createdAt: new Date().toISOString()
          },
          {
            id: "input-tracking",
            title: "Input Tracking",
            description: "Demonstrates basic tracking and rendering of XRInputSources. It does not respond to button presses or other controller interactions.",
            thumbnail: PLACEHOLDER_IMAGES.VR,
            pagePath: webXRBasePath + "input-tracking.html",
            type: "vr-experience",
            createdAt: new Date().toISOString()
          },
          {
            id: "hit-test",
            title: "Hit Test",
            description: "Demonstrates the use of hit testing to place virtual objects on real-world surfaces.",
            thumbnail: PLACEHOLDER_IMAGES.HIT_TEST,
            pagePath: webXRBasePath + "hit-test.html",
            type: "ar-experience",
            createdAt: new Date().toISOString()
          },
          {
            id: "anchors",
            title: "Anchors",
            description: "Demonstrates the use of anchors to place virtual objects in stable, real-world locations.",
            thumbnail: PLACEHOLDER_IMAGES.ANCHORS,
            pagePath: webXRBasePath + "anchors.html",
            type: "ar-experience",
            createdAt: new Date().toISOString()
          },
          {
            id: "immersive-hands",
            title: "Immersive VR with Hands",
            description: "Demonstrates a simple VR session that shows the user's hands using a set of cubes representing joints in your hand.",
            thumbnail: PLACEHOLDER_IMAGES.HANDS,
            pagePath: webXRBasePath + "immersive-hands.html",
            type: "vr-experience",
            createdAt: new Date().toISOString()
          },
          {
            id: "360-photos",
            title: "360 Photos",
            description: "Displays a 360 degree equirectangular stereo photo. It intentionally suppresses view position to ensure that the user cannot move out of the photo sphere.",
            thumbnail: PLACEHOLDER_IMAGES['360'],
            pagePath: webXRBasePath + "360-photos.html",
            type: "vr-experience",
            createdAt: new Date().toISOString()
          },
          {
            id: "stereo-video",
            title: "Stereo Video Player",
            description: "Demonstrates how to play a stereo 3D video in a VR environment.",
            thumbnail: PLACEHOLDER_IMAGES['360'],
            pagePath: webXRBasePath + "stereo-video.html",
            type: "vr-experience",
            createdAt: new Date().toISOString()
          },
          {
            id: "input-selection",
            title: "Input Selection",
            description: "Demonstrates handling 'select' events generated by XRInputSources to create clickable objects in the scene.",
            thumbnail: PLACEHOLDER_IMAGES.VR,
            pagePath: webXRBasePath + "input-selection.html",
            type: "vr-experience",
            createdAt: new Date().toISOString()
          },
          {
            id: "vr-barebones",
            title: "VR Barebones",
            description: "A minimal WebXR VR experience with no extra features.",
            thumbnail: PLACEHOLDER_IMAGES.VR,
            pagePath: webXRBasePath + "vr-barebones.html",
            type: "vr-experience",
            createdAt: new Date().toISOString()
          }
        ];
        
        // Then, try to fetch projects from API if user is logged in
        if (currentUser) {
          try {
            const response = await api.get('/api/projects');
            // Combine demo projects with fetched projects
            setProjects([...demoProjects, ...response.data]);
          } catch (error) {
            console.error('Error fetching projects:', error);
            // If API fails, just use demo projects
            setProjects(demoProjects);
          }
        } else {
          // If not logged in, just use demo projects
          setProjects(demoProjects);
        }
      } catch (error) {
        console.error('Error setting up projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentUser]);

  // Function to open a project
  const openProject = (project) => {
    if (project.type === '360-video' && project.videoUrl) {
      setSelectedVideo(project.videoUrl);
      setShowVideoModal(true);
    } else if ((project.type === 'ar-experience' || project.type === 'vr-experience') && project.pagePath) {
      // Ensure the polyfill is loaded before opening the WebXR experience
      if (!polyfillLoaded.current) {
        loadWebXRPolyfill()
          .then(() => {
            polyfillLoaded.current = true;
            openWebXRExperience(project);
          })
          .catch(error => {
            console.error('Error loading WebXR polyfill:', error);
            // Open the experience anyway, the page might handle loading the polyfill
            openWebXRExperience(project);
          });
      } else {
        openWebXRExperience(project);
      }
    } else if (project.model_url) {
      // Handle AR model viewing
      navigate(`/ar-viewer?model=${encodeURIComponent(project.model_url)}`);
    }
  };

  // Helper function to open WebXR experiences
  const openWebXRExperience = (project) => {
    // Direct link to the official WebXR samples
    window.open(project.pagePath, '_blank');
  };

  // Close video modal
  const handleCloseModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Our VR/AR Projects</h2>
      
      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No projects found. Create your first project to get started!</p>
          <Button variant="primary">Create New Project</Button>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {projects.map(project => (
            <Col key={project.id}>
              <Card className="h-100 shadow-sm">
                <Card.Img 
                  variant="top" 
                  src={project.thumbnail || PLACEHOLDER_IMAGES.DEFAULT} 
                  alt={project.title}
                  style={{ height: '180px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title>{project.title}</Card.Title>
                  <Card.Text>{project.description}</Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white border-0">
                  <Button 
                    variant="primary" 
                    className="w-100" 
                    onClick={() => openProject(project)}
                  >
                    {project.type === '360-video' ? 'Watch Video' : 
                     project.type === 'ar-experience' ? 'Launch AR Experience' : 
                     project.type === 'vr-experience' ? 'Launch VR Experience' : 'View in AR'}
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Video Player Modal */}
      <Modal 
        show={showVideoModal} 
        onHide={handleCloseModal} 
        size="xl" 
        centered
        contentClassName="bg-dark"
      >
        <Modal.Header closeButton closeVariant="white" className="border-0 text-white">
          <Modal.Title>Video Player</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedVideo && (
            <div style={{ height: '70vh' }}>
              <Suspense fallback={<div className="d-flex justify-content-center align-items-center h-100 text-white">
                <Spinner animation="border" />
                <span className="ms-2">Loading video player...</span>
              </div>}>
                <ReactPlayer
                  url={selectedVideo}
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
                    console.error("Video playback error:", e);
                  }}
                />
              </Suspense>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProjectsPage;