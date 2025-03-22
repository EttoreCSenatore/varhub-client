// frontend/src/components/FeedbackForm.jsx

import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Star, StarFill } from 'react-bootstrap-icons';

const FeedbackForm = ({ projectId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (!comments.trim()) {
      newErrors.comments = 'Please provide your feedback';
    } else if (comments.length < 10) {
      newErrors.comments = 'Feedback must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('http://localhost:5001/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          rating,
          comments: comments.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitStatus('success');
      setRating(0);
      setComments('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="feedback-form">
      {submitStatus === 'success' && (
        <Alert variant="success" className="mb-3">
          Thank you for your feedback!
        </Alert>
      )}
      
      {submitStatus === 'error' && (
        <Alert variant="danger" className="mb-3">
          Failed to submit feedback. Please try again.
        </Alert>
      )}

      <Form.Group className="mb-4">
        <Form.Label className="d-block">Rating</Form.Label>
        <div className="rating-buttons">
          {[1, 2, 3, 4, 5].map((value) => (
            <Button
              key={value}
              variant="outline-primary"
              className={`rating-button ${rating === value ? 'active' : ''} ${
                errors.rating ? 'is-invalid' : ''
              }`}
              onClick={() => setRating(value)}
              type="button"
            >
              {rating >= value ? <StarFill /> : <Star />}
            </Button>
          ))}
        </div>
        {errors.rating && (
          <Form.Control.Feedback type="invalid" className="d-block">
            {errors.rating}
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Comments</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Share your thoughts about this project..."
          isInvalid={!!errors.comments}
          className={errors.comments ? 'is-invalid' : ''}
        />
        {errors.comments && (
          <Form.Control.Feedback type="invalid">
            {errors.comments}
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </div>

      <style jsx>{`
        .feedback-form {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .rating-buttons {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .rating-button {
          padding: 8px 16px;
          border-radius: 20px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 45px;
        }

        .rating-button.active {
          background-color: #0d6efd;
          color: white;
        }

        .rating-button:hover {
          transform: scale(1.05);
        }

        .rating-button svg {
          width: 20px;
          height: 20px;
        }

        .is-invalid {
          border-color: #dc3545;
        }

        .is-invalid:focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
        }

        .feedback-form textarea {
          resize: vertical;
          min-height: 100px;
        }
      `}</style>
    </Form>
  );
};

export default FeedbackForm;