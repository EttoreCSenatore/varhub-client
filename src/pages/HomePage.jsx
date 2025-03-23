import React, { useState, useEffect } from 'react';
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
  InputGroup,
  Image,
  Carousel
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
import api from '../utils/api';
import { requestNotificationPermission } from '../firebase';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
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
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post(
        '/api/auth/login',
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
      const response = await api.post(
        '/api/auth/register',
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
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="align-items-center py-5">
        <Col lg={6} className="mb-5 mb-lg-0">
          <h1 className="display-4 fw-bold mb-4">Experience the Future with AR/VR Technology</h1>
          <p className="lead mb-4">
            VARhub makes it easy to create, share, and experience augmented and virtual reality content for education and training.
          </p>
          <div className="d-grid gap-2 d-md-flex">
            <Button as={Link} to="/login" variant="primary" size="lg" className="me-md-2">
              Get Started
            </Button>
            <Button as={Link} to="/projects" variant="outline-primary" size="lg">
              Explore Projects
            </Button>
          </div>
        </Col>
        <Col lg={6}>
          <div className="text-center">
            <Image src="/vr-hero.jpg" alt="VR Experience" fluid className="rounded shadow-lg" />
          </div>
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="py-5">
        <Col xs={12} className="text-center mb-5">
          <h2 className="fw-bold">Key Features</h2>
          <p className="lead">Everything you need to create immersive experiences</p>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="p-4 text-center">
              <div className="icon-box mb-4">
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
            <Card.Body className="p-4 text-center">
              <div className="icon-box mb-4">
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
            <Card.Body className="p-4 text-center">
              <div className="icon-box mb-4">
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

      {/* CTA Section */}
      <Row className="py-5 bg-light rounded-3 mt-5 p-5">
        <Col xs={12} className="text-center">
          <h2 className="fw-bold mb-4">Ready to Get Started?</h2>
          <p className="lead mb-4">Join thousands of educators and trainers already using VARhub</p>
          <Button as={Link} to="/login" variant="primary" size="lg">
            Create Your Account
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;