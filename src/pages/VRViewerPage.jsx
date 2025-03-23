import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VRPlayer from '../components/VRPlayer';
import api from '../utils/api';

// Sample fallback projects in case the API fails
const SAMPLE_PROJECTS = [
  {
    id: 'sample-1',
    name: 'Solar System VR Tour',
    description: 'Explore the solar system in immersive 360° virtual reality.',
    thumbnail_url: 'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    vr_video_url: 'https://cdn.aframe.io/360-video-boilerplate/video/city.mp4',
  },
  {
    id: 'sample-2',
    name: 'Underwater Exploration',
    description: 'Dive into the depths of the ocean with this stunning VR experience.',
    thumbnail_url: 'https://images.unsplash.com/photo-1682686580391-8ace8709092a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    vr_video_url: 'https://cdn.aframe.io/360-video-sample/video/raccoon.mp4',
  },
  {
    id: 'sample-3',
    name: 'Mount Everest Expedition',
    description: 'Experience climbing Mount Everest in VR without the physical risks.',
    thumbnail_url: 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    vr_video_url: 'https://cdn.aframe.io/360-video-boilerplate/video/city.mp4',
  }
];

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
  const [usingSampleData, setUsingSampleData] = useState(false);
  
  // Sample VR video URLs for testing (fallback)
  const sampleVideos = [
    { name: 'Sample VR Video 1', url: 'https://cdn.aframe.io/360-video-boilerplate/video/city.mp4' },
    { name: 'Sample VR Video 2', url: 'https://storage.googleapis.com/cardinal-choir-254220.appspot.com/homepage/360-video-forest.mp4' },
  ];

  // Fetch projects with VR videos from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('Fetching VR projects from API...');
        setLoading(true);
        const response = await api.get('/api/projects');
        console.log('VR projects API response:', response);
        // Filter projects that have a vr_video_url
        const projectsWithVRVideos = response.data.filter(project => project.vr_video_url);
        setProjects(projectsWithVRVideos);
        setUsingSampleData(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching VR projects:', err);
        // Use sample projects as fallback
        console.log('Using sample VR projects as fallback');
        setProjects(SAMPLE_PROJECTS);
        setUsingSampleData(true);
        setError('Could not connect to the server. Showing sample VR projects instead.');
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
      
      {error && usingSampleData && (
        <Alert variant="info" className="mb-4">
          {error}
        </Alert>
      )}
      
      {error && !usingSampleData && (
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