import React, { useState } from 'react';  
import { Link, useLocation } from 'react-router-dom';  
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { QrCodeScan, PersonCircle } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {  
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;
  
  const handleLogout = () => {
    logout();
    setExpanded(false);
  };
  
  const scrollToLogin = () => {
    // If on homepage, scroll to login section
    if (location.pathname === '/') {
      const loginSection = document.getElementById('login-register-section');
      if (loginSection) {
        loginSection.scrollIntoView({ behavior: 'smooth' });
      }
      setExpanded(false);
    }
  };
  
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
            
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="user-dropdown" className="d-flex align-items-center">
                  <PersonCircle className="me-2" />
                  {user.name}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              location.pathname === '/' ? (
                <Nav.Link 
                  href="#login-register-section" 
                  className="btn btn-light text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToLogin();
                  }}
                >
                  Login
                </Nav.Link>
              ) : (
                <Nav.Link 
                  as={Link} 
                  to="/" 
                  className="btn btn-light text-primary"
                  onClick={() => setExpanded(false)}
                >
                  Login
                </Nav.Link>
              )
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );  
};  

export default NavBar;