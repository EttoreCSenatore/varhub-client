import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import ARViewer from '../components/ARViewer';
import axios from 'axios';

const ARViewerPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no projectId provided, show an empty viewer
    if (!projectId) return;
    
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Handle test project IDs
        if (projectId === 'test-project-123') {
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
        
        const response = await axios.get(`/api/projects/${projectId}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId]);

  return (
    <Container className="py-3 py-md-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="h4 mb-0">
                  {project ? `AR Viewer: ${project.name}` : 'AR Viewer'}
                </h2>
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" className="mb-3" />
                  <p>Loading AR Content...</p>
                </div>
              ) : error ? (
                <Alert variant="danger" className="m-3">
                  {error}
                </Alert>
              ) : (
                <ARViewer 
                  modelUrl={project?.model_url || project?.model_3d_url}
                  markerUrl={project?.marker_image_url}
                />
              )}
            </Card.Body>
          </Card>
          
          {project && (
            <Card className="shadow-sm">
              <Card.Header>
                <h3 className="h5 mb-0">Project Details</h3>
              </Card.Header>
              <Card.Body>
                <h4>{project.name}</h4>
                <p>{project.description}</p>
                
                {project.image_url && (
                  <div className="text-center my-3">
                    <img 
                      src={project.image_url} 
                      alt={project.name} 
                      className="img-fluid rounded" 
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}
                
                {project.vr_video_url && (
                  <div className="mt-3">
                    <Button 
                      variant="success"
                      onClick={() => navigate(`/vr-viewer/${project.id}`)}
                    >
                      View VR Experience
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
          
          <Card className="shadow-sm mt-4">
            <Card.Header>
              <h3 className="h5 mb-0">How to use AR</h3>
            </Card.Header>
            <Card.Body className="p-3 p-md-4">
              <ol className="mb-0">
                <li className="mb-2">Allow camera access when prompted</li>
                <li className="mb-2">If a marker is provided, point your camera at it</li>
                <li className="mb-2">The 3D model will appear on the marker</li>
                <li className="mb-2">Move around to view the model from different angles</li>
                <li>For best results, ensure good lighting conditions</li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ARViewerPage; 