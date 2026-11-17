import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { Download, PencilSquare, Plus } from 'react-bootstrap-icons';
import api, { errorMessage } from '../utils/api';
import { projectQrUrl } from '../utils/qr';
import { TYPE_INFO } from '../utils/projects';
import Loading from '../components/Loading';

const EMPTY = { title: '', description: '', type: 'model', status: 'draft', thumbnail_url: '', model_url: '', ios_model_url: '', video_url: '', page_url: '' };
const URL_FIELDS = {
  model: [['model_url', '3D model (.glb)'], ['ios_model_url', 'iOS model (.usdz, optional)']],
  video360: [['video_url', '360° video (.mp4, equirectangular)']],
  webxr: [['page_url', 'Experience page URL']],
  link: [['page_url', 'Link URL']],
};

function Tile({ label, value }) {
  return (
    <Col xs={6} md={3}>
      <Card body className="text-center h-100"><div className="display-6">{value}</div><div className="small text-muted">{label}</div></Card>
    </Col>
  );
}

// A QR code a staff member can print: it opens the project and counts as a scan.
async function downloadQr(project) {
  const { toDataURL } = await import('qrcode');
  const url = await toDataURL(projectQrUrl(window.location.origin, project.id), { width: 768, margin: 2, errorCorrectionLevel: 'M' });
  const a = document.createElement('a');
  a.href = url;
  a.download = `varhub-qr-${project.id}.png`;
  a.click();
}

function ProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState(project?.id ? { ...EMPTY, ...Object.fromEntries(Object.entries(project).map(([k, v]) => [k, v ?? ''])) } : EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const payload = Object.fromEntries(['title', 'description', 'type', 'status', 'thumbnail_url', 'model_url', 'ios_model_url', 'video_url', 'page_url'].map((k) => [k, form[k] === '' ? null : form[k]]));
    try {
      if (project?.id) await api.put(`/api/projects/${project.id}`, payload);
      else await api.post('/api/projects', payload);
      onSaved();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered scrollable>
      <Form onSubmit={save}>
        <Modal.Header closeButton><Modal.Title as="h2" className="h5">{project?.id ? 'Edit project' : 'New project'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="p-title"><Form.Label>Title</Form.Label><Form.Control value={form.title} onChange={set('title')} required maxLength={255} /></Form.Group>
          <Form.Group className="mb-3" controlId="p-desc"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} value={form.description} onChange={set('description')} /></Form.Group>
          <Row>
            <Col><Form.Group className="mb-3" controlId="p-type"><Form.Label>Type</Form.Label>
              <Form.Select value={form.type} onChange={set('type')}>{Object.entries(TYPE_INFO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</Form.Select></Form.Group></Col>
            <Col><Form.Group className="mb-3" controlId="p-status"><Form.Label>Status</Form.Label>
              <Form.Select value={form.status} onChange={set('status')}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></Form.Select></Form.Group></Col>
          </Row>
          <Form.Group className="mb-3" controlId="p-thumb"><Form.Label>Thumbnail URL</Form.Label><Form.Control type="url" value={form.thumbnail_url} onChange={set('thumbnail_url')} /></Form.Group>
          {URL_FIELDS[form.type].map(([key, label]) => (
            <Form.Group className="mb-3" controlId={`p-${key}`} key={key}><Form.Label>{label}</Form.Label><Form.Control type="url" value={form[key]} onChange={set(key)} /></Form.Group>
          ))}
          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer><Button variant="outline-secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button></Modal.Footer>
      </Form>
    </Modal>
  );
}

export default function AdminPage() {
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    try {
      const [s, p] = await Promise.all([api.get('/api/analytics/summary'), api.get('/api/admin/projects')]);
      setSummary(s.data);
      setProjects(p.data);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (error) return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!summary || !projects) return <Container><Loading label="Loading dashboard…" /></Container>;

  const max = Math.max(1, ...summary.daily.map((d) => d.events));
  const stats = new Map(summary.projects.map((p) => [p.id, p]));

  return (
    <Container className="py-4">
      <h1 className="h3 mb-3">Dashboard</h1>
      <Row className="g-3 mb-4">
        <Tile label="Published projects" value={summary.totals.projects} />
        <Tile label="QR scans" value={summary.totals.qr_scans} />
        <Tile label="AR launches" value={summary.totals.ar_launches} />
        <Tile label={`Feedback (avg ${summary.totals.avg_rating || '–'})`} value={summary.totals.feedback} />
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <h2 className="h6">Activity, last 14 days</h2>
          <div className="vh-bars" role="img" aria-label={`Daily activity, peak ${max} events`}>
            {summary.daily.map((d) => (
              <div key={d.date} className="vh-bar" title={`${d.date}: ${d.events}`} style={{ height: `${(d.events / max) * 100}%` }} />
            ))}
          </div>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="h5 mb-0">Projects</h2>
        <Button size="sm" onClick={() => setEditing({})}><Plus aria-hidden /> New project</Button>
      </div>
      <div className="table-responsive">
        <Table hover className="align-middle">
          <thead><tr><th>Title</th><th>Status</th><th className="text-end">Views</th><th className="text-end">Scans</th><th className="text-end">AR</th><th className="text-end">Rating</th><th /></tr></thead>
          <tbody>
            {projects.map((p) => {
              const s = stats.get(p.id) || {};
              return (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td><span className={`badge bg-${p.status === 'published' ? 'success' : 'secondary'}`}>{p.status}</span></td>
                  <td className="text-end">{s.views ?? 0}</td><td className="text-end">{s.qr_scans ?? 0}</td><td className="text-end">{s.ar_launches ?? 0}</td>
                  <td className="text-end">{p.feedback_count ? `${p.avg_rating} (${p.feedback_count})` : '–'}</td>
                  <td className="text-end text-nowrap">
                    <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => setEditing(p)} aria-label={`Edit ${p.title}`}><PencilSquare aria-hidden /></Button>
                    <Button size="sm" variant="outline-primary" onClick={() => downloadQr(p)} aria-label={`Download QR code for ${p.title}`}><Download aria-hidden /> QR</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {editing && <ProjectModal project={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </Container>
  );
}
