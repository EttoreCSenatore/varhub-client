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

// Sample fallback projects in case the API fails
const SAMPLE_PROJECTS = [
  {
    id: 'sample-1',
    name: 'Solar System VR Tour',
    description: 'Explore the solar system in immersive 360° virtual reality. Learn about planets, moons, and other celestial bodies.',
    thumbnail_url: 'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    vr_video_url: 'https://cdn.aframe.io/360-video-boilerplate/video/city.mp4',
    status: 'published'
  },
  {
    id: 'sample-2',
    name: 'Underwater Exploration',
    description: 'Dive into the depths of the ocean with this stunning VR experience. Observe marine life in their natural habitat.',
    thumbnail_url: 'https://images.unsplash.com/photo-1682686580391-8ace8709092a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    vr_video_url: 'https://storage.googleapis.com/cardinal-choir-254220.appspot.com/homepage/360-video-forest.mp4',
    status: 'published'
  },
  {
    id: 'sample-3',
    name: 'Mount Everest Expedition',
    description: 'Experience the thrill of climbing Mount Everest in VR without the physical risks. Stunning 360° views from the world\'s highest peak.',
    thumbnail_url: 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    vr_video_url: 'https://cdn.aframe.io/360-video-boilerplate/video/city.mp4',
    status: 'published'
  }
];

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('Fetching projects from API...');
        setLoading(true);
        const response = await api.get('/api/projects');
        console.log('Projects API response:', response);
        setProjects(response.data);
        setUsingSampleData(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        
        // More detailed error information
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', {
            data: err.response.data,
            status: err.response.status,
            headers: err.response.headers
          });
        } else if (err.request) {
          // The request was made but no response was received
          console.error('No response received:', err.request);
        } else {
          // Something happened in setting up the request
          console.error('Request setup error:', err.message);
        }
        
        // Use sample projects as fallback
        console.log('Using sample projects as fallback');
        setProjects(SAMPLE_PROJECTS);
        setUsingSampleData(true);
        setError('Could not connect to the server. Showing sample projects instead.');
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

  return (
    <Container className="py-3 py-md-5">
      <div className="mb-4">
        <h1 className="mb-0">My Projects</h1>
        {usingSampleData && (
          <Alert variant="info" className="mt-3">
            {error}
          </Alert>
        )}
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