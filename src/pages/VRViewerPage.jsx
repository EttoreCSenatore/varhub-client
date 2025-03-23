import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VRPlayer from '../components/VRPlayer';
import api from '../utils/api';

const VRViewerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlParam = searchParams.get('url');
  const nameParam = searchParams.get('name');
  
  const [videoUrl, setVideoUrl] = useState(urlParam || '');
  const [videoName, setVideoName] = useState(nameParam || '');
  const [showPlayer, setShowPlayer] = useState(!!urlParam);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sample VR video URLs for testing (fallback)
  const sampleVideos = [
    { name: 'Sample VR Video 1', url: 'https://cdn.aframe.io/360-video-boilerplate/video/city.mp4' },
    { name: 'Sample VR Video 2', url: 'https://cdn.aframe.io/360-video-sample/video/raccoon.mp4' },
  ];

  // Fetch projects with VR videos from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/projects');
        // Filter projects that have a vr_video_url
        const projectsWithVRVideos = response.data.filter(project => project.vr_video_url);
        setProjects(projectsWithVRVideos);
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectSelection = (e) => {
    const selectedProject = projects.find(p => p.vr_video_url === e.target.value);
    if (selectedProject) {
      setVideoUrl(selectedProject.vr_video_url);
      setVideoName(selectedProject.name);
    }
  };

  const handleSampleSelection = (e) => {
    const url = e.target.value;
    const selectedSample = sampleVideos.find(v => v.url === url);
    if (selectedSample) {
      setVideoUrl(selectedSample.url);
      setVideoName(selectedSample.name);
    }
  };

  const handlePlayVideo = (e) => {
    e.preventDefault();
    if (videoUrl) {
      setShowPlayer(true);
      // Update URL with parameters for sharing
      navigate(`/vr-viewer?url=${encodeURIComponent(videoUrl)}&name=${encodeURIComponent(videoName)}`, 
        { replace: true });
    }
  };

  const handleBackToSelection = () => {
    setShowPlayer(false);
    // Remove URL parameters
    navigate('/vr-viewer', { replace: true });
  };

  if (loading && !urlParam) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-2">Loading VR content...</p>
      </Container>
    );
  }

  return (
    <Container className="py-3 py-md-4">
      <h1 className="mb-3 mb-md-4">VR Video Viewer</h1>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {!showPlayer ? (
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h2 className="h4 mb-0">Select a VR Video</h2>
              </Card.Header>
              <Card.Body className="p-3 p-md-4">
                <Form onSubmit={handlePlayVideo}>
                  {projects.length > 0 && (
                    <Form.Group className="mb-3">
                      <Form.Label>Select a project to view in VR</Form.Label>
                      <Form.Select onChange={handleProjectSelection} value={videoUrl}>
                        <option value="">Choose a project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.vr_video_url}>
                            {project.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  )}
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Enter VR Video URL</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter URL to 360-degree video" 
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value);
                        setVideoName('Custom Video');
                      }}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Or select a sample video</Form.Label>
                    <Form.Select onChange={handleSampleSelection} value={videoUrl}>
                      <option value="">Choose a sample video</option>
                      {sampleVideos.map((video, index) => (
                        <option key={index} value={video.url}>{video.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={!videoUrl}
                    >
                      Play Video
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <div>
          <div className="d-flex align-items-center mb-3">
            <Button 
              variant="secondary" 
              onClick={handleBackToSelection}
              className="me-3"
            >
              Back to Selection
            </Button>
            {videoName && <h3 className="mb-0">{videoName}</h3>}
          </div>
          <div className="vr-player-container rounded overflow-hidden shadow-sm" style={{ height: '70vh', width: '100%' }}>
            <VRPlayer videoUrl={videoUrl} />
          </div>
        </div>
      )}
    </Container>
  );
};

export default VRViewerPage; 