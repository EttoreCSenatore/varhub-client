import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import api from '../utils/api';

vi.mock('../utils/api', () => ({ default: { get: vi.fn() } }));

describe('Footer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the app and the API versions', async () => {
    api.get.mockResolvedValue({ data: { version: '2.3.4' } });
    render(<Footer />);
    expect(await screen.findByTestId('versions')).toHaveTextContent(/api v2\.3\.4/);
    expect(api.get).toHaveBeenCalledWith('/api/version');
  });

  it('still renders when the API is unreachable', async () => {
    api.get.mockRejectedValue(new Error('offline'));
    render(<Footer />);
    expect(screen.getByTestId('versions')).toHaveTextContent(/^app v/);
    expect(screen.queryByText(/api v/)).not.toBeInTheDocument();
  });
});
