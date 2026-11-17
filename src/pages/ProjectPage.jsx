import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Container } from 'react-bootstrap';
import { BoxArrowUpRight, Share } from 'react-bootstrap-icons';
import api, { errorMessage, track } from '../utils/api';
import { thumbnailFor, typeInfo } from '../utils/projects';
import { supportsImmersiveAr } from '../utils/xr';
import FeedbackForm from '../components/FeedbackForm';
import Loading from '../components/Loading';
import ModelViewer from '../components/ModelViewer';
import StarRating from '../components/StarRating';
import Video360 from '../components/Video360';

export default function ProjectPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [xr, setXr] = useState(null);
  const [shareNote, setShareNote] = useState('');

  const loadFeedback = useCallback(() => {
    api.get(`/api/projects/${id}/feedback`).then(({ data }) => setFeedback(data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setProject(null);
    setError(null);
    api.get(`/api/projects/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setProject(data);
        track('project_view', data.id);
        if (params.get('src') === 'qr') track('qr_scan', data.id);
      })
      .catch((e) => { if (!cancelled) setError(e.response?.status === 404 ? 'This project does not exist or is no longer published.' : errorMessage(e)); });
    loadFeedback();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loadFeedback]);

  useEffect(() => { if (project?.type === 'webxr') supportsImmersiveAr().then(setXr); }, [project]);

  const launchWebXr = () => {
    track('ar_launch', project.id);
    window.open(project.page_url, '_blank', 'noopener,noreferrer');
  };
  const onArLaunch = useCallback(() => track('ar_launch', Number(id)), [id]);
  const onVideoPlay = useCallback(() => track('video_play', Number(id)), [id]);

  const share = async () => {
    const url = `${window.location.origin}/projects/${id}`;
    try {
      if (navigator.share) await navigator.share({ title: project.title, url });
      else { await navigator.clipboard.writeText(url); setShareNote('Link copied'); }
      track('share', project.id);
    } catch { /* the user dismissed the share sheet */ }
  };

  if (error) return <Container className="py-5"><Alert variant="warning">{error}</Alert><Link to="/projects">← All projects</Link></Container>;
  if (!project) return <Container><Loading label="Loading project…" /></Container>;

  return (
    <Container className="py-4 vh-narrow">
      <Link to="/projects" className="small">← All projects</Link>
      <div className="d-flex justify-content-between align-items-start gap-2 mt-2">
        <div>
          <Badge bg="primary">{typeInfo(project.type).label}</Badge>
          <h1 className="h3 mt-2">{project.title}</h1>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={share} aria-label="Share this project"><Share aria-hidden /> {shareNote || 'Share'}</Button>
      </div>
      {project.description && <p className="text-muted">{project.description}</p>}

      <div className="my-4">
        {project.type === 'model' && project.model_url && (
          <ModelViewer src={project.model_url} iosSrc={project.ios_model_url} poster={project.thumbnail_url} alt={project.title} onArLaunch={onArLaunch} />
        )}
        {project.type === 'video360' && project.video_url && (
          <Video360 src={project.video_url} poster={project.thumbnail_url} onPlay={onVideoPlay} />
        )}
        {project.type === 'webxr' && (
          <Card body className="text-center">
            <img src={thumbnailFor(project)} alt="" className="vh-detail-img mb-3" />
            {xr === false && <Alert variant="info" className="text-start">This demo needs Chrome on an ARCore-capable Android phone. You can still open it to read about it.</Alert>}
            <Button size="lg" onClick={launchWebXr}><BoxArrowUpRight className="me-2" aria-hidden />{typeInfo('webxr').action}</Button>
          </Card>
        )}
        {project.type === 'link' && project.page_url && (
          <Button as="a" size="lg" href={project.page_url} target="_blank" rel="noopener noreferrer" onClick={() => track('share', null)}>
            <BoxArrowUpRight className="me-2" aria-hidden />Open
          </Button>
        )}
        {((project.type === 'model' && !project.model_url) || (project.type === 'video360' && !project.video_url)) && (
          <Alert variant="warning">This project has no media yet.</Alert>
        )}
      </div>

      <Card className="mb-4">
        <Card.Body>
          <h2 className="h5">What did you think?</h2>
          <FeedbackForm projectId={project.id} onSubmitted={loadFeedback} />
        </Card.Body>
      </Card>

      {feedback && feedback.count > 0 && (
        <section aria-labelledby="fb-title">
          <h2 className="h5" id="fb-title">Visitor feedback</h2>
          <p className="d-flex align-items-center gap-2"><StarRating value={feedback.average} size={20} /> <strong>{feedback.average}</strong> <span className="text-muted">({feedback.count})</span></p>
          {feedback.recent.map((f) => (
            <blockquote key={`${f.created_at}-${f.comment}`} className="vh-quote">
              <StarRating value={f.rating} size={14} /> <span>{f.comment}</span>
            </blockquote>
          ))}
        </section>
      )}
    </Container>
  );
}
