import React, { useState } from 'react';  
import axios from 'axios';  
import { useNavigate, Link } from 'react-router-dom';  
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  InputGroup, 
  Tabs,
  Tab
} from 'react-bootstrap';
import { 
  EnvelopeFill, 
  LockFill, 
  Google,
  PersonFill 
} from 'react-bootstrap-icons';

const LoginPage = () => {  
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');  
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const navigate = useNavigate();  

  const handleLogin = async (e) => {  
    e.preventDefault();  
    setLoading(true);
    setError('');

    // Validate input
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {  
      const response = await axios.post(  
        'http://localhost:5000/api/auth/login',  
        { email, password }  
      );  

      if (response.data.success) {
        // Save token and user data to localStorage  
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/projects'); // Redirect to projects page  
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error) {  
      console.error('Login error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data.message || 'Login failed. Please check your credentials.');
      } else if (error.request) {
        // The request was made but no response was received
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }  
  };  

  const handleRegister = async (e) => {
    e.preventDefault();
    
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
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/projects');
      } else {
        setError(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data.message || 'Registration failed. Please try again.');
      } else if (error.request) {
        // The request was made but no response was received
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = () => {
    // Implementation for Google OAuth login
    alert('Google login will be implemented with Firebase Authentication');
  };

  return (  
    <Container className="py-5">  
      <Row className="justify-content-center">  
        <Col md={8} lg={6} xl={5}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Welcome to VARhub</h2>
              
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
                      <InputGroup>
                        <InputGroup.Text>
                          <EnvelopeFill />
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex justify-content-end">
                      <Link to="#" className="text-decoration-none">Forgot Password?</Link>
                    </Form.Group>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                    <div className="text-center mb-3">
                      <small className="text-muted">or</small>
                    </div>
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
                    <div className="text-center mb-3">
                      <small className="text-muted">or</small>
                    </div>
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
          
          <div className="text-center mt-4">
            <p className="mb-0">
              By signing up, you agree to our <Link to="#" className="text-decoration-none">Terms of Service</Link> and <Link to="#" className="text-decoration-none">Privacy Policy</Link>
            </p>
          </div>
        </Col>  
      </Row>  
    </Container>  
  );  
};  

export default LoginPage;