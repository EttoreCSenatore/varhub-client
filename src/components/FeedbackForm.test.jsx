import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedbackForm from './FeedbackForm';
import api from '../utils/api';

vi.mock('../utils/api', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, default: { post: vi.fn() } };
});

describe('FeedbackForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('asks for a rating before sending', async () => {
    render(<FeedbackForm projectId={4} />);
    await userEvent.click(screen.getByRole('button', { name: /send feedback/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/choose a rating/i);
    expect(api.post).not.toHaveBeenCalled();
  });

  it('sends the rating and comment, then thanks the visitor', async () => {
    api.post.mockResolvedValue({});
    const onSubmitted = vi.fn();
    render(<FeedbackForm projectId={4} onSubmitted={onSubmitted} />);
    await userEvent.click(screen.getByRole('radio', { name: '4 stars' }));
    await userEvent.type(screen.getByLabelText(/comments/i), ' Loved it ');
    await userEvent.click(screen.getByRole('button', { name: /send feedback/i }));
    expect(api.post).toHaveBeenCalledWith('/api/feedback', { projectId: 4, rating: 4, comments: 'Loved it' });
    expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
    expect(onSubmitted).toHaveBeenCalled();
  });

  it('shows the server message when sending fails', async () => {
    api.post.mockRejectedValue({ response: { data: { message: 'Too many requests, try again later' } } });
    render(<FeedbackForm projectId={4} />);
    await userEvent.click(screen.getByRole('radio', { name: '5 stars' }));
    await userEvent.click(screen.getByRole('button', { name: /send feedback/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many requests');
  });
});
