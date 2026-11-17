import { useEffect, useMemo, useState } from 'react';
import { Alert, Col, Container, Form, Row } from 'react-bootstrap';
import api, { errorMessage } from '../utils/api';
import { TYPE_INFO } from '../utils/projects';
import Loading from '../components/Loading';
import ProjectCard from '../components/ProjectCard';

export default function ProjectsPage() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.get('/api/projects')
      .then(({ data }) => { if (!cancelled) setProjects(data); })
      .catch((e) => { if (!cancelled) { setError(errorMessage(e)); setProjects([]); } });
    return () => { cancelled = true; };
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (projects || []).filter(
      (p) => (!type || p.type === type) && (!q || `${p.title} ${p.description || ''}`.toLowerCase().includes(q))
    );
  }, [projects, query, type]);

  return (
    <Container className="py-4">
      <h1 className="h3 mb-3">Projects</h1>
      <Form.Control
        type="search"
        placeholder="Search projects"
        aria-label="Search projects"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3"
      />
      <div className="vh-chips mb-4" role="group" aria-label="Filter by type">
        {[['', 'All'], ...Object.entries(TYPE_INFO).map(([k, v]) => [k, v.label])].map(([key, label]) => (
          <button key={key} type="button" className={`vh-chip ${type === key ? 'active' : ''}`} aria-pressed={type === key} onClick={() => setType(key)}>
            {label}
          </button>
        ))}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {projects === null ? <Loading label="Loading projects…" /> : shown.length === 0 && !error ? (
        <p className="text-muted text-center py-5">{projects.length ? 'No projects match your search.' : 'No projects have been published yet.'}</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-3">
          {shown.map((p) => <Col key={p.id}><ProjectCard project={p} /></Col>)}
        </Row>
      )}
    </Container>
  );
}
