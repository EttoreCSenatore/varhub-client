import React, { useState } from 'react';  
import { Link, useLocation } from 'react-router-dom';  
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { QrCodeScan, CameraVideoFill } from 'react-bootstrap-icons';

const NavBar = () => {  
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const isActive = (path) => location.pathname === path;
  
  return (  
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top" expanded={expanded} className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          VARhub
        </Navbar.Brand>
        <Navbar.Toggle 
          aria-controls="responsive-navbar-nav" 
          onClick={() => setExpanded(expanded ? false : "expanded")}
        />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              active={isActive('/')}
              onClick={() => setExpanded(false)}
            >
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/projects" 
              active={isActive('/projects')}
              onClick={() => setExpanded(false)}
            >
              Projects
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/vr-viewer" 
              active={isActive('/vr-viewer')}
              onClick={() => setExpanded(false)}
            >
              VR Viewer
            </Nav.Link>
          </Nav>
          <Nav>
            <Button 
              variant="outline-light" 
              className="me-2 d-flex align-items-center"
              as={Link}
              to="/scan"
              onClick={() => setExpanded(false)}
            >
              <QrCodeScan className="me-2" /> Scan QR
            </Button>
            <Nav.Link 
              as={Link} 
              to="/login" 
              className="btn btn-light text-primary"
              onClick={() => setExpanded(false)}
            >
              Login
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );  
};  

export default NavBar;