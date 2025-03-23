import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import VRPlayer from '../components/VRPlayer';

const VRViewerPage = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  
  // Sample VR video URLs for testing
  const sampleVideos = [
    { name: 'Sample VR Video 1', url: 'https://cdn.aframe.io/360-video-boilerplate/video/city.mp4' },
  ];

  const handleSampleSelection = (e) => {
    const url = e.target.value;
    setVideoUrl(url);
  };

  const handlePlayVideo = (e) => {
    e.preventDefault();
    if (videoUrl) {
      setShowPlayer(true);
    }
  };

  return (
    <Container className="py-3 py-md-4">
      <h1 className="mb-3 mb-md-4">VR Video Viewer</h1>
      
      {!showPlayer ? (
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h2 className="h4 mb-0">Select a VR Video</h2>
              </Card.Header>
              <Card.Body className="p-3 p-md-4">
                <Form onSubmit={handlePlayVideo}>
                  <Form.Group className="mb-3">
                    <Form.Label>Enter VR Video URL</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter URL to 360-degree video" 
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Or select a sample video</Form.Label>
                    <Form.Select onChange={handleSampleSelection}>
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
          <Button 
            variant="secondary" 
            className="mb-3"
            onClick={() => setShowPlayer(false)}
          >
            Back to Selection
          </Button>
          <div className="vr-player-container rounded overflow-hidden shadow-sm" style={{ height: '70vh', width: '100%' }}>
            <VRPlayer videoUrl={videoUrl} />
          </div>
        </div>
      )}
    </Container>
  );
};

export default VRViewerPage; 