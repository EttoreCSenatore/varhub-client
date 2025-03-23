import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { VrCardboard, QrCodeScan } from 'react-bootstrap-icons';
import { getProjects } from '../utils/api';
import NavBar from '../components/NavBar';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const result = await getProjects();
            if (result.success) {
                setProjects(result.data);
                setError(null);
            } else {
                setError(result.error || 'Failed to fetch projects');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderProjects = () => {
        if (loading) {
            return (
                <Col className="text-center py-5">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Col>
            );
        }

        if (error) {
            return (
                <Col xs={12}>
                    <Alert variant="danger">
                        {error}
                    </Alert>
                    <Button variant="primary" onClick={fetchProjects}>
                        Try Again
                    </Button>
                </Col>
            );
        }

        if (projects.length === 0) {
            return (
                <Col xs={12}>
                    <Alert variant="info">
                        No projects found. Check back later.
                    </Alert>
                </Col>
            );
        }

        return projects.map(project => (
            <Col key={project.id} xs={12} md={6} lg={4} className="mb-4">
                <Card className="h-100 shadow-sm project-card">
                    <div className="card-img-container">
                        <Card.Img 
                            variant="top" 
                            src={project.thumbnail_url || 'https://via.placeholder.com/300x200?text=No+Image'} 
                            alt={project.name}
                            className="project-thumbnail" 
                        />
                    </div>
                    <Card.Body className="d-flex flex-column">
                        <Card.Title>{project.name}</Card.Title>
                        <Card.Text className="flex-grow-1">
                            {project.description}
                        </Card.Text>
                        <div className="d-flex justify-content-between mt-3">
                            <Button 
                                as={Link} 
                                to={`/vr-viewer/${project.id}`} 
                                variant="outline-primary"
                                className="d-flex align-items-center"
                            >
                                <VrCardboard className="me-2" />
                                VR View
                            </Button>
                            <Button 
                                as={Link} 
                                to={`/qr-scanner?projectId=${project.id}`} 
                                variant="outline-secondary"
                                className="d-flex align-items-center"
                            >
                                <QrCodeScan className="me-2" />
                                AR View
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        ));
    };

    return (
        <div className="projects-page">
            <NavBar />
            <Container className="py-4">
                <Row className="mb-4 align-items-center">
                    <Col>
                        <h1 className="mb-0">Explore Projects</h1>
                    </Col>
                    <Col xs="auto">
                        <Button 
                            variant="primary" 
                            as={Link} 
                            to="/qr-scanner"
                            className="d-flex align-items-center"
                        >
                            <QrCodeScan className="me-2" />
                            Scan QR Code
                        </Button>
                    </Col>
                </Row>
                <Row>
                    {renderProjects()}
                </Row>
            </Container>
        </div>
    );
};

export default ProjectsPage;