import { Link } from 'react-router-dom';
import { Badge, Card } from 'react-bootstrap';
import { thumbnailFor, typeInfo } from '../utils/projects';
import StarRating from './StarRating';

export default function ProjectCard({ project }) {
  return (
    <Card className="h-100 vh-card">
      <Link to={`/projects/${project.id}`} className="text-decoration-none text-reset stretched-link-parent">
        <Card.Img variant="top" src={thumbnailFor(project)} alt="" loading="lazy" className="vh-card-img" />
        <Card.Body>
          <Badge bg="primary" className="mb-2">{typeInfo(project.type).label}</Badge>
          <Card.Title as="h3" className="h5">{project.title}</Card.Title>
          {project.description && <Card.Text className="text-muted vh-clamp">{project.description}</Card.Text>}
        </Card.Body>
        <Card.Footer className="bg-transparent border-0 pt-0 d-flex align-items-center justify-content-between">
          <span className="fw-semibold text-primary">{typeInfo(project.type).action} →</span>
          {project.feedback_count > 0 && (
            <span className="small text-muted d-inline-flex align-items-center gap-1">
              <StarRating value={project.avg_rating} size={14} /> {project.avg_rating}
            </span>
          )}
        </Card.Footer>
      </Link>
    </Card>
  );
}
