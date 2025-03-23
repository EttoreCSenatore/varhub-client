import React, { useState, useEffect } from 'react';  
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
import { useAuth } from '../context/AuthContext';

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
  const { login, register, currentUser } = useAuth();
  
  // Redirect if user is already logged in
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
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-3 p-md-4">
              <h2 className="text-center mb-4">Welcome</h2>
              
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
    </Container>
  );
};  

export default LoginPage;