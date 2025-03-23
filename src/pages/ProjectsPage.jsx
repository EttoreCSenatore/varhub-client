import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Function to open a project's VR experience
  const openVRExperience = (project) => {
    if (project.type === '360-video' && project.videoUrl) {
      window.location.href = `/vr-viewer?video=${encodeURIComponent(project.videoUrl)}`;
    } else if (project.model_url) {
      // Handle AR model viewing
      window.location.href = `/ar-viewer?model=${encodeURIComponent(project.model_url)}`;
    }
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
                  <Button 
                    variant="primary" 
                    className="w-100" 
                    onClick={() => openVRExperience(project)}
                  >
                    View in VR
                  </Button>
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