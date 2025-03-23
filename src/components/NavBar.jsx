import React, { useState } from 'react';  
import { Link, useLocation } from 'react-router-dom';  
import { Navbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { QrCodeScan, CameraVideoFill, PersonCircle, WifiOff, Wifi } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {  
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const { currentUser, logout, isOfflineMode, toggleOfflineMode } = useAuth();

  const isActive = (path) => location.pathname === path;
  
  const handleLogout = () => {
    logout();
    setExpanded(false);
  };
  
  const scrollToLogin = () => {
    // If on homepage, scroll to login section
    if (location.pathname === '/') {
      const loginSection = document.getElementById('login-section');
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
          {isOfflineMode && (
            <Badge 
              bg="warning" 
              text="dark" 
              className="ms-2 align-middle" 
              style={{ fontSize: '0.6rem' }}
            >
              OFFLINE
            </Badge>
          )}
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
            {isOfflineMode && (
              <Button
                variant="warning"
                size="sm"
                className="me-2 d-flex align-items-center"
                onClick={toggleOfflineMode}
              >
                <Wifi className="me-1" /> Go Online
              </Button>
            )}
            {!isOfflineMode && (
              <Button
                variant="outline-light"
                size="sm"
                className="me-2 d-flex align-items-center"
                onClick={toggleOfflineMode}
              >
                <WifiOff className="me-1" /> Offline Mode
              </Button>
            )}
            
            <Button 
              variant="outline-light" 
              className="me-2 d-flex align-items-center"
              as={Link}
              to="/scan"
              onClick={() => setExpanded(false)}
            >
              <QrCodeScan className="me-2" /> Scan QR
            </Button>
            
            {currentUser ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="user-dropdown" className="d-flex align-items-center">
                  <PersonCircle className="me-2" />
                  {currentUser.name}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as="button" onClick={toggleOfflineMode}>
                    {isOfflineMode ? (
                      <>
                        <Wifi className="me-2" /> Go Online
                      </>
                    ) : (
                      <>
                        <WifiOff className="me-2" /> Use Offline Mode
                      </>
                    )}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              location.pathname === '/' ? (
                <Nav.Link 
                  href="#login-section" 
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