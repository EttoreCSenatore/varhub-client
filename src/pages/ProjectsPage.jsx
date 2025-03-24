import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Container, Row, Col, Card, Button, Spinner, ButtonGroup, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// Use lazy loading for ReactPlayer to prevent 404 errors with chunked files
const ReactPlayer = lazy(() => import('react-player/lazy'));

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // First, add our demo VR House Tour project
        const demoProjects = [{
          id: "vr-house-tour",
          title: "VR House Tour",
          description: "Experience a virtual reality tour of a modern house in 360°",
          thumbnail: "https://via.placeholder.com/300x200?text=VR+House+Tour",
          videoUrl: "https://varhub-videos.s3.us-east-2.amazonaws.com/project-alpha-360.mp4",
          type: "360-video",
          createdAt: new Date().toISOString()
        }];
        
        // Then, try to fetch projects from API if user is logged in
        if (currentUser) {
          try {
            const response = await api.get('/api/projects');
            // Combine demo project with fetched projects
            setProjects([...demoProjects, ...response.data]);
          } catch (error) {
            console.error('Error fetching projects:', error);
            // If API fails, just use demo project
            setProjects(demoProjects);
          }
        } else {
          // If not logged in, just use demo project
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

  // Function to open a project's video directly in a modal
  const openVideoPlayer = (project) => {
    if (project.type === '360-video' && project.videoUrl) {
      setSelectedVideo(project.videoUrl);
      setShowVideoModal(true);
    } else if (project.model_url) {
      // Handle AR model viewing
      window.location.href = `/ar-viewer?model=${encodeURIComponent(project.model_url)}`;
    }
  };

  // Close video modal
  const handleCloseModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">My VR Projects</h2>
      
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
                  src={project.thumbnail || "https://via.placeholder.com/300x200?text=Project"} 
                  alt={project.title}
                  style={{ height: '180px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title>{project.title}</Card.Title>
                  <Card.Text>{project.description}</Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white border-0">
                  {project.type === '360-video' ? (
                    <Button 
                      variant="primary" 
                      className="w-100" 
                      onClick={() => openVideoPlayer(project)}
                    >
                      Watch Video
                    </Button>
                  ) : (
                    <Button 
                      variant="primary" 
                      className="w-100" 
                      onClick={() => openVideoPlayer(project)}
                    >
                      View in AR
                    </Button>
                  )}
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