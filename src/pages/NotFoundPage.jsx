import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="shadow-sm text-center">
            <Card.Body className="p-5">
              <h1 className="display-1 text-danger mb-4">404</h1>
              <h2 className="h3 mb-4">Page Not Found</h2>
              <p className="text-muted mb-4">
                The page you are looking for doesn't exist or has been moved.
              </p>
              <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
                <Button as={Link} to="/" variant="primary">
                  Go to Homepage
                </Button>
                <Button as={Link} to="/projects" variant="outline-secondary">
                  View Projects
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage; 