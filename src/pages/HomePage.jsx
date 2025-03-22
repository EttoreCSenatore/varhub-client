import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Tabs, 
  Tab, 
  Alert, 
  InputGroup
} from 'react-bootstrap';
import { 
  Google, 
  EnvelopeFill, 
  LockFill, 
  PersonFill, 
  Buildings, 
  Diagram3, 
  Camera
} from 'react-bootstrap-icons';
import axios from 'axios';
import { requestNotificationPermission } from '../firebase';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email: loginEmail, password: loginPassword }
      );
      
      localStorage.setItem('token', response.data.token);
      navigate('/projects');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerPassword !== registerConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        {
          name: registerName,
          email: registerEmail,
          password: registerPassword
        }
      );
      
      localStorage.setItem('token', response.data.token);
      navigate('/projects');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = () => {
    // Implementation for Google OAuth login
    alert('Google login will be implemented with Firebase Authentication');
  };
  
  const enableNotifications = async () => {
    const token = await requestNotificationPermission();
    // Send this token to your backend to store in the database
  };

  return (
    <Container fluid className="p-0">
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">Experience Architecture in AR</h1>
              <p className="lead mb-4">
                VARhub provides immersive augmented reality experiences for architectural and engineering projects.
                Visualize 3D models in real space before they're built.
              </p>
              <Button 
                variant="light" 
                size="lg" 
                className="me-3 mb-3"
                onClick={() => {
                  setActiveTab('register');
                  // Scroll to the form
                  const formElement = document.querySelector('#auth-tabs');
                  if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Get Started
              </Button>
              <Button 
                variant="outline-light" 
                size="lg"
                className="mb-3"
                as={Link} 
                to="/projects"
              >
                View Projects
              </Button>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow">
                <Card.Body className="p-4">
                  <Tabs
                    id="auth-tabs"
                    activeKey={activeTab}
                    onSelect={(k) => {
                      setActiveTab(k);
                      setError('');
                    }}
                    className="mb-4"
                  >
                    <Tab eventKey="login" title="Login">
                      {error && <Alert variant="danger">{error}</Alert>}
                      <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                          <InputGroup>
                            <InputGroup.Text>
                              <EnvelopeFill />
                            </InputGroup.Text>
                            <Form.Control
                              type="email"
                              placeholder="Email Address"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              required
                            />
                          </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <InputGroup>
                            <InputGroup.Text>
                              <LockFill />
                            </InputGroup.Text>
                            <Form.Control
                              type="password"
                              placeholder="Password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              required
                            />
                          </InputGroup>
                        </Form.Group>
                        <Button 
                          variant="primary" 
                          type="submit" 
                          className="w-100 mb-3"
                          disabled={loading}
                        >
                          {loading ? 'Logging in...' : 'Login'}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          className="w-100 d-flex align-items-center justify-content-center"
                          onClick={handleGoogleLogin}
                        >
                          <Google className="me-2" /> Continue with Google
                        </Button>
                      </Form>
                    </Tab>
                    <Tab eventKey="register" title="Register">
                      {error && <Alert variant="danger">{error}</Alert>}
                      <Form onSubmit={handleRegister}>
                        <Form.Group className="mb-3">
                          <InputGroup>
                            <InputGroup.Text>
                              <PersonFill />
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              placeholder="Full Name"
                              value={registerName}
                              onChange={(e) => setRegisterName(e.target.value)}
                              required
                            />
                          </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <InputGroup>
                            <InputGroup.Text>
                              <EnvelopeFill />
                            </InputGroup.Text>
                            <Form.Control
                              type="email"
                              placeholder="Email Address"
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              required
                            />
                          </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <InputGroup>
                            <InputGroup.Text>
                              <LockFill />
                            </InputGroup.Text>
                            <Form.Control
                              type="password"
                              placeholder="Password"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              required
                            />
                          </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <InputGroup>
                            <InputGroup.Text>
                              <LockFill />
                            </InputGroup.Text>
                            <Form.Control
                              type="password"
                              placeholder="Confirm Password"
                              value={registerConfirmPassword}
                              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                              required
                            />
                          </InputGroup>
                        </Form.Group>
                        <Button 
                          variant="primary" 
                          type="submit" 
                          className="w-100 mb-3"
                          disabled={loading}
                        >
                          {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          className="w-100 d-flex align-items-center justify-content-center"
                          onClick={handleGoogleLogin}
                        >
                          <Google className="me-2" /> Register with Google
                        </Button>
                      </Form>
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* Features Section */}
      <Container className="py-5">
        <h2 className="text-center mb-5">Why Choose VARhub?</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="feature-icon bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                  <Buildings size={32} />
                </div>
                <h3 className="h4 mb-3">Architectural Visualization</h3>
                <p className="mb-0">Experience buildings and structures in augmented reality before construction begins.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="feature-icon bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                  <Diagram3 size={32} />
                </div>
                <h3 className="h4 mb-3">Detailed Analytics</h3>
                <p className="mb-0">Access comprehensive data and insights about your projects and user interactions.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="feature-icon bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                  <Camera size={32} />
                </div>
                <h3 className="h4 mb-3">QR Code Integration</h3>
                <p className="mb-0">Scan QR codes to instantly view 3D models in augmented reality on-site.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {/* CTA Section */}
      <div className="bg-light py-5">
        <Container className="text-center">
          <h2 className="mb-4">Ready to experience the future of architectural visualization?</h2>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => setActiveTab('register')}
            href="#top"
          >
            Sign Up Now
          </Button>
        </Container>
      </div>
    </Container>
  );
};

export default HomePage;