import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import api, { errorMessage } from '../utils/api';
import StarRating from './StarRating';

// Anyone can send feedback; no account needed.
export default function FeedbackForm({ projectId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState({ state: 'idle' });

  const submit = async (event) => {
    event.preventDefault();
    if (rating === 0) {
      setStatus({ state: 'error', message: 'Please choose a rating from 1 to 5 stars.' });
      return;
    }
    setStatus({ state: 'sending' });
    try {
      await api.post('/api/feedback', { projectId, rating, comments: comments.trim() });
      setStatus({ state: 'done' });
      onSubmitted?.();
    } catch (error) {
      setStatus({ state: 'error', message: errorMessage(error) });
    }
  };

  if (status.state === 'done') {
    return <Alert variant="success" className="mb-0">Thank you! Your feedback helps VARLab improve.</Alert>;
  }

  return (
    <Form onSubmit={submit} noValidate>
      <Form.Group className="mb-3">
        <Form.Label className="d-block">How was this experience?</Form.Label>
        <StarRating value={rating} onChange={setRating} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="feedback-comments">
        <Form.Label>Comments <span className="text-muted">(optional)</span></Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          maxLength={2000}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="What did you like? What could be better?"
        />
      </Form.Group>
      {status.state === 'error' && <Alert variant="danger" role="alert">{status.message}</Alert>}
      <Button type="submit" disabled={status.state === 'sending'}>
        {status.state === 'sending' ? 'Sending…' : 'Send feedback'}
      </Button>
    </Form>
  );
}
