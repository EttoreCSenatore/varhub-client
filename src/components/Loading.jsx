import { Spinner } from 'react-bootstrap';

export default function Loading({ label = 'Loading…' }) {
  return (
    <div className="text-center py-5" role="status" aria-live="polite">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 text-muted mb-0">{label}</p>
    </div>
  );
}
