import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Image,
  Form,
  InputGroup,
  Tabs,
  Tab,
  Alert
} from 'react-bootstrap';
import { 
  Buildings, 
  Diagram3, 
  Camera,
  Google,
  EnvelopeFill,
  LockFill,
  PersonFill
} from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, login, register } = useAuth();
  
  // Login/Register state
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  // Redirect to projects page if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/projects');
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {  
    e.preventDefault();  
    setError('');

    // Validate input
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      navigate('/projects');
    } else {
      setError(result.message);
    }
  };  

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate input
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password
    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    const result = await register(registerName, registerEmail, registerPassword);
    setLoading(false);
    
    if (result.success) {
      navigate('/projects');
    } else {
      setError(result.message);
    }
  };
  
  const handleGoogleLogin = () => {
    // Google login will be implemented later
    setError('Google login is not implemented yet');
  };

  return (
    <Container className="py-3 py-md-5">
      {/* Hero Section */}
      <Row className="align-items-center py-3 py-md-5">
        <Col lg={6} className="mb-4 mb-lg-0">
          <h1 className="display-4 fw-bold mb-3 mb-md-4">Experience the Future with AR/VR Technology</h1>
          <p className="lead mb-4">
            VARhub makes it easy to create, share, and experience augmented and virtual reality content for education and training.
          </p>
          <div className="d-grid gap-2 d-md-flex">
            <Button 
              variant="primary" 
              size="lg" 
              className="me-md-2"
              onClick={() => {
                const loginSection = document.getElementById('login-section');
                if (loginSection) {
                  loginSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Get Started
            </Button>
          </div>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-3 p-md-4">
              <h2 className="text-center mb-4" id="login-section">Welcome</h2>
              
              <Tabs 
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
                      <Form.Label>Email</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <EnvelopeFill />
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          placeholder="Your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                        />
                      </InputGroup>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Password</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <LockFill />
                        </InputGroup.Text>
                        <Form.Control
                          type="password"
                          placeholder="Your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                        />
                      </InputGroup>
                    </Form.Group>
                    
                    <div className="d-grid mb-3">
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Logging in...' : 'Login'}
                      </Button>
                    </div>
                    
                    <div className="text-center mb-3">
                      <small>OR</small>
                    </div>
                    
                    <div className="d-grid">
                      <Button 
                        variant="outline-danger" 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                      >
                        <Google className="me-2" /> Login with Google
                      </Button>
                    </div>
                  </Form>
                </Tab>
                
                <Tab eventKey="register" title="Register">
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <Form onSubmit={handleRegister}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <PersonFill />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Your name"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          disabled={loading}
                        />
                      </InputGroup>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <EnvelopeFill />
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          placeholder="Your email"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          disabled={loading}
                        />
                      </InputGroup>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <LockFill />
                        </InputGroup.Text>
                        <Form.Control
                          type="password"
                          placeholder="Choose a password (6+ characters)"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          disabled={loading}
                        />
                      </InputGroup>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Confirm Password</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <LockFill />
                        </InputGroup.Text>
                        <Form.Control
                          type="password"
                          placeholder="Confirm your password"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          disabled={loading}
                        />
                      </InputGroup>
                    </Form.Group>
                    
                    <div className="d-grid mb-3">
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Registering...' : 'Register'}
                      </Button>
                    </div>
                  </Form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="py-3 py-md-5">
        <Col xs={12} className="text-center mb-4 mb-md-5">
          <h2 className="fw-bold">Key Features</h2>
          <p className="lead">Everything you need to create immersive experiences</p>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="p-3 p-md-4 text-center">
              <div className="icon-box mb-3 mb-md-4">
                <Camera size={48} className="text-primary" />
              </div>
              <Card.Title>AR Scanning</Card.Title>
              <Card.Text>
                Scan QR codes to instantly launch interactive AR experiences on any mobile device.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="p-3 p-md-4 text-center">
              <div className="icon-box mb-3 mb-md-4">
                <Buildings size={48} className="text-primary" />
              </div>
              <Card.Title>3D Model Library</Card.Title>
              <Card.Text>
                Access a growing collection of 3D models to enhance your educational content.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="p-3 p-md-4 text-center">
              <div className="icon-box mb-3 mb-md-4">
                <Diagram3 size={48} className="text-primary" />
              </div>
              <Card.Title>Easy Content Management</Card.Title>
              <Card.Text>
                Create, organize, and share your AR/VR projects with intuitive management tools.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CTA Section for Mobile */}
      <Row className="d-lg-none py-4 py-md-5 bg-light rounded-3 mt-4 mt-md-5 p-3 p-md-5">
        <Col xs={12} className="text-center">
          <h2 className="fw-bold mb-3 mb-md-4">Ready to Get Started?</h2>
          <p className="lead mb-3 mb-md-4">Join thousands of educators and trainers already using VARhub</p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => {
              const loginSection = document.getElementById('login-section');
              if (loginSection) {
                loginSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Create Your Account
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;