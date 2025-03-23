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
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

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

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" className="mb-3" />
        <p>Loading projects...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Projects</h1>
        <Button variant="primary">Create New Project</Button>
      </div>

      {projects.length === 0 ? (
        <Alert variant="info">
          You don't have any projects yet. Create your first project to get started!
        </Alert>
      ) : (
        <Row>
          {projects.map((project) => (
            <Col md={4} className="mb-4" key={project.id}>
              <Card className="h-100 shadow-sm">
                <Card.Img 
                  variant="top" 
                  src={project.thumbnail_url || '/placeholder-project.jpg'} 
                  alt={project.name}
                  style={{ height: '180px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title>{project.name}</Card.Title>
                  <Card.Text>{project.description}</Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white border-0">
                  <Button variant="outline-primary" className="w-100">View Details</Button>
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