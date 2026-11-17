import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, Container, Form, Tab, Tabs } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { brand } from '../brand';

// Only same-site paths are allowed as a redirect target (no open redirects).
const safeNext = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : '/projects');

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [tab, setTab] = useState('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={next} replace />;

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    if (tab === 'register' && form.get('password') !== form.get('confirm')) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    const result = tab === 'login'
      ? await login(form.get('email'), form.get('password'))
      : await register(form.get('name'), form.get('email'), form.get('password'));
    setBusy(false);
    if (result.success) navigate(next, { replace: true });
    else setError(result.message);
  };

  return (
    <Container className="py-4" style={{ maxWidth: 460 }}>
      <Card>
        <Card.Body>
          <h1 className="h4 mb-1">Welcome to {brand.name}</h1>
          <p className="text-muted small">An account is optional. It only lets you keep your feedback linked to you.</p>
          <Tabs activeKey={tab} onSelect={(k) => { setTab(k); setError(''); }} className="mb-3" fill>
            <Tab eventKey="login" title="Sign in" />
            <Tab eventKey="register" title="Create account" />
          </Tabs>
          <Form onSubmit={submit}>
            {tab === 'register' && (
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control name="name" required maxLength={100} autoComplete="name" />
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" type="email" required autoComplete="email" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control name="password" type="password" required minLength={tab === 'register' ? 8 : undefined} autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
              {tab === 'register' && <Form.Text>At least 8 characters.</Form.Text>}
            </Form.Group>
            {tab === 'register' && (
              <Form.Group className="mb-3" controlId="confirm">
                <Form.Label>Confirm password</Form.Label>
                <Form.Control name="confirm" type="password" required autoComplete="new-password" />
              </Form.Group>
            )}
            {error && <Alert variant="danger" role="alert">{error}</Alert>}
            <Button type="submit" className="w-100" disabled={busy}>{busy ? 'Please wait…' : tab === 'login' ? 'Sign in' : 'Create account'}</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
