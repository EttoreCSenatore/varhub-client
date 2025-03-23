import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import VRPlayer from '../components/VRPlayer';
import NavBar from '../components/NavBar';
import { getProjectById } from '../utils/api';

// Sample videos for fallback
const SAMPLE_VIDEOS = [
  { id: 'sample-1', name: 'City Street', url: 'https://cdn.aframe.io/360-video-boilerplate/video/city.mp4' },
  { id: 'sample-2', name: 'Forest Scene', url: 'https://storage.googleapis.com/cardinal-choir-254220.appspot.com/homepage/360-video-forest.mp4' },
  { id: 'sample-3', name: 'Raccoon', url: 'https://cdn.aframe.io/360-video-sample/video/raccoon.mp4' },
];

const VRViewerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const urlParam = searchParams.get('url');
  const nameParam = searchParams.get('name');
  
  const [videoUrl, setVideoUrl] = useState(urlParam || '');
  const [videoName, setVideoName] = useState(nameParam || '');
  const [customUrl, setCustomUrl] = useState('');
  const [showPlayer, setShowPlayer] = useState(!!urlParam);
  const [loading, setLoading] = useState(projectId ? true : false);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [selectedSampleId, setSelectedSampleId] = useState('');

  // Fetch project if ID is provided
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId]);

  const fetchProject = async (id) => {
    setLoading(true);
    try {
      const result = await getProjectById(id);
      if (result.success) {
        setProject(result.data);
        if (result.data.vr_video_url) {
          setVideoUrl(result.data.vr_video_url);
          setVideoName(result.data.name);
          setShowPlayer(true);
        }
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch project details');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomUrlSubmit = (e) => {
    e.preventDefault();
    if (customUrl) {
      setVideoUrl(customUrl);
      setVideoName('Custom Video');
      setSelectedSampleId('');
      setShowPlayer(true);
    }
  };

  const handleSampleSelect = (e) => {
    const sampleId = e.target.value;
    setSelectedSampleId(sampleId);
    
    if (sampleId) {
      const sample = SAMPLE_VIDEOS.find(video => video.id === sampleId);
      if (sample) {
        setVideoUrl(sample.url);
        setVideoName(sample.name);
        setCustomUrl('');
        setShowPlayer(true);
      }
    } else {
      setVideoUrl('');
      setShowPlayer(false);
    }
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  if (loading) {
    return (
      <div className="vr-viewer-page">
        <NavBar />
        <Container className="py-4">
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="vr-viewer-page">
      <NavBar />
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h1>{project ? project.name : (videoName || 'VR Viewer')}</h1>
            {project && <p>{project.description}</p>}
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* VR Player */}
        {showPlayer && videoUrl && (
          <div className="vr-player-container mb-4">
            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
              <iframe
                src={`https://aframe-vr-player.vercel.app/?video_url=${encodeURIComponent(videoUrl)}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px'
                }}
                allowFullScreen
                allow="xr-spatial-tracking; gyroscope; accelerometer"
                title="VR Player"
              ></iframe>
            </div>
          </div>
        )}

        {/* URL Input Section */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="mb-3 mb-md-0">
              <Card.Body>
                <Card.Title>Enter VR Video URL</Card.Title>
                <Form onSubmit={handleCustomUrlSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Enter URL to 360° video"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Load Video
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Or Select Sample Video</Card.Title>
                <Form.Group>
                  <Form.Select
                    value={selectedSampleId}
                    onChange={handleSampleSelect}
                  >
                    <option value="">Select a sample video</option>
                    {SAMPLE_VIDEOS.map(video => (
                      <option key={video.id} value={video.id}>
                        {video.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="text-center mb-4">
          <Button variant="secondary" onClick={handleBackToProjects}>
            Back to Projects
          </Button>
        </div>

        {/* Instructions */}
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>VR Viewing Instructions</Card.Title>
            <ul>
              <li>Click and drag to look around the 360° environment</li>
              <li>Use a VR headset for full immersion</li>
              <li>Click the VR goggle icon in the bottom right for VR mode</li>
              <li>For mobile, use full screen and move your phone to look around</li>
            </ul>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default VRViewerPage; 