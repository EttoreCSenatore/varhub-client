import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Spinner, 
  Alert 
} from 'react-bootstrap';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/api/projects');
        setProjects(response.data);
      } catch (err) {
        setError('Failed to load projects. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleViewInVR = (vrVideoUrl, projectName) => {
    navigate(`/vr-viewer?url=${encodeURIComponent(vrVideoUrl)}&name=${encodeURIComponent(projectName)}`);
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status" className="mb-3" />
        <p>Loading projects...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-3 py-md-5">
      <div className="mb-4">
        <h1 className="mb-0">My Projects</h1>
      </div>

      {projects.length === 0 ? (
        <Alert variant="info">
          You don't have any projects yet.
        </Alert>
      ) : (
        <Row xs={1} sm={2} lg={3}>
          {projects.map((project) => (
            <Col className="mb-4" key={project.id}>
              <Card className="h-100 shadow-sm">
                {project.vr_video_url ? (
                  <div className="card-video-container">
                    <ReactPlayer
                      url={project.vr_video_url}
                      controls={true}
                      width="100%"
                      height="180px"
                      light={project.thumbnail_url || '/placeholder-project.jpg'}
                      config={{
                        file: {
                          attributes: {
                            crossOrigin: 'anonymous',
                            controlsList: 'nodownload'
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <Card.Img 
                    variant="top" 
                    src={project.thumbnail_url || '/placeholder-project.jpg'} 
                    alt={project.name}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{project.name}</Card.Title>
                  <Card.Text>{project.description}</Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white border-0 d-flex justify-content-between">
                  <Button variant="outline-primary" className="flex-grow-1 me-2">View Details</Button>
                  {project.vr_video_url && (
                    <Button 
                      variant="outline-secondary" 
                      className="flex-grow-1 ms-2"
                      onClick={() => handleViewInVR(project.vr_video_url, project.name)}
                    >
                      View in VR
                    </Button>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ProjectsPage;