import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { BoxArrowRight, QrCodeScan } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
import { brand } from '../brand';

export default function NavBar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Navbar expand="md" className="vh-nav" sticky="top" collapseOnSelect>
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <img src="/logo192.png" alt="" width="28" height="28" className="me-2 rounded" />
          {brand.name}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/projects" eventKey="projects">Projects</Nav.Link>
            <Nav.Link as={NavLink} to="/scan" eventKey="scan">Scan QR</Nav.Link>
            {isAdmin && <Nav.Link as={NavLink} to="/admin" eventKey="admin">Admin</Nav.Link>}
          </Nav>
          <Nav className="align-items-md-center gap-md-2">
            {user ? (
              <>
                <span className="navbar-text small">Hi, {user.name.split(' ')[0]}</span>
                <Nav.Link
                  as="button"
                  className="btn btn-link text-start"
                  onClick={() => { logout(); navigate('/'); }}
                >
                  <BoxArrowRight className="me-1" aria-hidden /> Sign out
                </Nav.Link>
              </>
            ) : (
              <Nav.Link as={NavLink} to="/login" eventKey="login">Sign in</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
      {/* On phones the main action is always one tap away. */}
      {pathname !== '/scan' && (
        <Link to="/scan" className="vh-fab d-md-none" aria-label="Scan a QR code">
          <QrCodeScan size={26} aria-hidden />
        </Link>
      )}
    </Navbar>
  );
}
