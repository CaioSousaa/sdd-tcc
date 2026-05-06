import { render, screen, waitFor } from '@testing-library/react';
import AuthGuard from '@/components/AuthGuard';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('AuthGuard — sem token', () => {
  it('redirects to / when localStorage has no token', async () => {
    render(
      <AuthGuard>
        <p>conteúdo protegido</p>
      </AuthGuard>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('does not render children when token is absent', async () => {
    render(
      <AuthGuard>
        <p>conteúdo protegido</p>
      </AuthGuard>,
    );

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());

    expect(screen.queryByText('conteúdo protegido')).not.toBeInTheDocument();
  });
});

describe('AuthGuard — com token', () => {
  it('renders children when localStorage has a token', async () => {
    localStorage.setItem('token', 'valid-jwt-token');

    render(
      <AuthGuard>
        <p>conteúdo protegido</p>
      </AuthGuard>,
    );

    await waitFor(() => {
      expect(screen.getByText('conteúdo protegido')).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not redirect when token is present', async () => {
    localStorage.setItem('token', 'valid-jwt-token');

    render(
      <AuthGuard>
        <p>conteúdo protegido</p>
      </AuthGuard>,
    );

    await waitFor(() => expect(screen.getByText('conteúdo protegido')).toBeInTheDocument());

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
