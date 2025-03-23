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
  Alert,
  Nav,
  NavItem
} from 'react-bootstrap';
import { 
  Buildings, 
  Diagram3, 
  Camera,
  Google,
  EnvelopeFill,
  LockFill,
  PersonFill,
  BoxSeam,
  PersonCircle,
  EyeFill,
  CameraFill,
  QrCodeScan
} from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, login, register } = useAuth();
  
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
    if (user) {
      navigate('/projects');
    }
  }, [user, navigate]);

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'login':
        return (
          <>
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
          </>
        );
      case 'register':
        return (
          <>
            {error && (
              typeof error === 'string' 
                ? <Alert variant="danger">{error}</Alert>
                : error // If error is a React component (for offline mode option)
            )}
            
            {/* Network error notice */}
            {localStorage.getItem('autoOfflineMode') === 'true' && (
              <Alert variant="warning" className="mb-3">
                <Alert.Heading className="h6">Network Connection Issue</Alert.Heading>
                <p className="mb-0">
                  Server connection problem detected. The app has switched to offline mode with sample data.
                  Some features may be limited.
                </p>
              </Alert>
            )}
            
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
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="home-container">
      <NavBar />
      <main className="d-flex flex-column align-items-center justify-content-center py-4">
        {/* Welcome Section */}
        <section className="welcome-section text-center mb-5 px-3">
          <h1 className="display-4 mb-4">Welcome to VARhub</h1>
          <p className="lead mb-4">
            Your platform for interactive VR and AR experiences
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Button variant="primary" size="lg" onClick={() => navigate('/projects')}>
              <BoxSeam className="me-2" />
              Browse Projects
            </Button>
            <Button 
              variant="outline-primary" 
              size="lg" 
              onClick={() => {
                const loginElement = document.getElementById('login-register-section');
                if (loginElement) {
                  loginElement.scrollIntoView({ behavior: 'smooth' });
                  setActiveTab('login');
                }
              }}
            >
              <PersonCircle className="me-2" />
              Log In / Register
            </Button>
          </div>
        </section>

        {/* Login/Register Section */}
        <section id="login-register-section" className="bg-light p-4 rounded-3 shadow-sm mb-5 w-100 max-width-500">
          <Tab.Container id="login-register-tabs" activeKey={activeTab} onSelect={setActiveTab}>
            <Tab.Content>
              {renderTabContent()}
            </Tab.Content>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="login">Login</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="register">Register</Nav.Link>
              </Nav.Item>
            </Nav>
          </Tab.Container>
        </section>
        
        {/* Features Section */}
        <section className="features-section text-center mb-5 px-3">
          <h2 className="mb-4">Why Choose VARhub?</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="feature-item p-3">
                <div className="feature-icon mb-3">
                  <EyeFill size={32} />
                </div>
                <h3 className="h5">Immersive VR</h3>
                <p>Experience stunning virtual reality worlds</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-item p-3">
                <div className="feature-icon mb-3">
                  <CameraFill size={32} />
                </div>
                <h3 className="h5">AR Visualization</h3>
                <p>Bring 3D models into your real-world environment</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-item p-3">
                <div className="feature-icon mb-3">
                  <QrCodeScan size={32} />
                </div>
                <h3 className="h5">QR Scanning</h3>
                <p>Quickly access content with our QR scanner</p>
              </div>
            </Col>
          </Row>
        </section>
      </main>
    </div>
  );
};

export default HomePage;