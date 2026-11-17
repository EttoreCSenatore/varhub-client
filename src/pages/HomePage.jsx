import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Chat, Phone, QrCodeScan } from 'react-bootstrap-icons';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';
import { brand } from '../brand';

const STEPS = [
  { icon: QrCodeScan, title: 'Scan', text: 'Point your phone at a {brand.org} QR code, or open a project from the list.' },
  { icon: Phone, title: 'Explore', text: 'Turn 3D models, place them in your room with AR, or look around in 360° video.' },
  { icon: Chat, title: 'Tell us', text: 'Rate what you saw. Your feedback shapes what {brand.org} builds next.' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api.get('/api/projects').then(({ data }) => { if (!cancelled) setFeatured(data.slice(0, 3)); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <section className="vh-hero">
        <Container>
          <h1>Step into {brand.org}’s projects</h1>
          <p className="lead">{brand.tagline}</p>
          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to="/scan" size="lg" variant="light"><QrCodeScan className="me-2" aria-hidden />Scan a QR code</Button>
            <Button as={Link} to="/projects" size="lg" variant="outline-light">Browse projects</Button>
          </div>
        </Container>
      </section>

      <Container className="py-5">
        <Row className="g-4 text-center">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <Col md={4} key={title}>
              <div className="vh-step-icon"><Icon size={28} aria-hidden /></div>
              <h2 className="h5 mt-3">{i + 1}. {title}</h2>
              <p className="text-muted mb-0">{text}</p>
            </Col>
          ))}
        </Row>
      </Container>

      {featured.length > 0 && (
        <Container className="pb-4">
          <div className="d-flex justify-content-between align-items-baseline mb-3">
            <h2 className="h4 mb-0">Latest projects</h2>
            <Link to="/projects">See all</Link>
          </div>
          <Row xs={1} md={3} className="g-3">
            {featured.map((p) => <Col key={p.id}><ProjectCard project={p} /></Col>)}
          </Row>
        </Container>
      )}
    </>
  );
}
