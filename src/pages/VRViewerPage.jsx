import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VRPlayer from '../components/VRPlayer';
import ApiErrorFallback from '../components/ApiErrorFallback';
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
  const [isOfflineMode, setIsOfflineMode] = useState(localStorage.getItem('useMockData') === 'true');
  
  // Sample VR video URLs for testing (fallback)
  const sampleVideos = [
    { name: 'Sample VR Video 1', url: 'https://cdn.aframe.io/360-video-boilerplate/video/city.mp4' },
  ];

  // Fetch projects with VR videos from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Check if we were automatically switched to offline mode
        const autoOfflineMode = localStorage.getItem('autoOfflineMode');
        if (autoOfflineMode === 'true') {
          // Clear the flag so it only shows once
          localStorage.removeItem('autoOfflineMode');
          setError('Network connection failed. Automatically switched to offline mode.');
          setIsOfflineMode(true);
          setUsingSampleData(true);
          setProjects(SAMPLE_PROJECTS);
          setLoading(false);
          return;
        }
        
        console.log('Fetching VR projects from API...');
        setLoading(true);
        
        // Create a manual abort controller to handle timeouts
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
          // Try using fetch API as an alternative to axios
          const apiUrl = import.meta.env.MODE === 'development' 
            ? '/api/projects' 
            : 'https://varhub-server.vercel.app/api/projects';
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('VR projects API response:', data);
          
          // Filter projects that have a vr_video_url
          const projectsWithVRVideos = data.filter(project => project.vr_video_url);
          setProjects(projectsWithVRVideos);
          setUsingSampleData(false);
          setError(null);
          return;
        } catch (fetchError) {
          console.warn('Fetch API failed, falling back to axios:', fetchError);
          clearTimeout(timeoutId);
          
          // Check for specific net::ERR_FAILED error
          if (fetchError.message && fetchError.message.includes('net::ERR_FAILED')) {
            throw new Error(`Resource failed to load: ${fetchError.message}. This may be due to network connectivity issues.`);
          }
          
          // Fall back to axios if fetch fails
          const axiosResponse = await api.get('/api/projects');
          
          // Check if we should switch to offline mode from axios response
          if (axiosResponse.useOfflineMode) {
            throw new Error('API server is unreachable. Switched to offline mode automatically.');
          }
          
          console.log('VR projects axios API response:', axiosResponse);
          
          // Filter projects that have a vr_video_url
          const projectsWithVRVideos = axiosResponse.data.filter(project => project.vr_video_url);
          setProjects(projectsWithVRVideos);
          setUsingSampleData(false);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        
        // Always show the string representation of the error for debugging
        const errorString = String(err);
        console.log('Error details:', errorString);
        
        // Check if we need to show the auto-offline mode notification
        if (err.useOfflineMode) {
          console.log('Automatically switched to offline mode due to API error');
          window.location.reload();
          return;
        }
        
        // Provide more specific error messages based on the error type
        let errorMessage = 'Could not connect to the server. Showing sample VR projects instead.';
        
        if (errorString.includes('ERR_FAILED')) {
          errorMessage = 'Failed to load resources from the server. This may be due to network connectivity issues. Using sample VR projects instead.';
        } else if (errorString.includes('timeout') || errorString.includes('abort')) {
          errorMessage = 'Request timed out. The server took too long to respond.';
        } else if (errorString.includes('Network Error') || errorString.includes('No response')) {
          errorMessage = 'Network Error: No response received from server. Check your internet connection.';
        } else if (errorString.includes('CORS')) {
          errorMessage = 'Cross-Origin Resource Sharing (CORS) error. The server is blocking requests from this domain.';
        }
        
        // Use sample projects as fallback
        console.log('Using sample VR projects as fallback');
        setProjects(SAMPLE_PROJECTS);
        setUsingSampleData(true);
        setError(errorMessage);
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

  // Function to toggle offline mode
  const toggleOfflineMode = () => {
    const newOfflineMode = !isOfflineMode;
    setIsOfflineMode(newOfflineMode);
    if (newOfflineMode) {
      localStorage.setItem('useMockData', 'true');
    } else {
      localStorage.removeItem('useMockData');
    }
    window.location.reload(); // Reload to apply the change
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
      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4">
        <h1 className="mb-0">VR Video Viewer</h1>
        
        <div>
          {isOfflineMode && (
            <Badge bg="secondary" className="me-2">Offline Mode</Badge>
          )}
          <Button 
            variant={isOfflineMode ? "outline-success" : "outline-secondary"}
            size="sm"
            onClick={toggleOfflineMode}
          >
            {isOfflineMode ? "Go Online" : "Use Offline Mode"}
          </Button>
        </div>
      </div>
      
      {error && usingSampleData && (
        <ApiErrorFallback 
          error={error} 
          resetErrorBoundary={() => {
            setError(null);
            setLoading(true);
            fetchProjects();
          }} 
        />
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