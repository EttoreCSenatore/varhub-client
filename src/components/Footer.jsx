import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row className="gy-4">
          <Col md={4}>
            <h5>VARhub</h5>
            <p className="text-muted mb-0">
              Augmented reality visualization platform for architectural and engineering projects.
            </p>
          </Col>
          
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-light">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/projects" className="text-decoration-none text-light">Projects</Link>
              </li>
              <li className="mb-2">
                <Link to="/scan" className="text-decoration-none text-light">QR Scanner</Link>
              </li>
              <li>
                <Link to="/analytics" className="text-decoration-none text-light">Analytics</Link>
              </li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h5>Contact</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="bi bi-envelope-fill me-2"></i>
                contact@varhub.com
              </li>
              <li>
                <i className="bi bi-geo-alt-fill me-2"></i>
                123 Tech Avenue, Innovation District
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4 border-secondary" />
        
        <Row>
          <Col className="text-center text-md-start">
            <p className="small text-muted mb-0">
              &copy; {year} VARhub. All rights reserved.
            </p>
          </Col>
          <Col className="text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="#" className="text-muted text-decoration-none">
                  Privacy Policy
                </a>
              </li>
              <li className="list-inline-item ms-3">
                <a href="#" className="text-muted text-decoration-none">
                  Terms of Service
                </a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 