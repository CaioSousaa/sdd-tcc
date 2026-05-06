import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import LoginForm from '@/components/LoginForm';
import api from '@/lib/axios';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

const mockPost = (api as unknown as { post: jest.Mock }).post;

function createAxiosError(status: number, message: string) {
  const error = new axios.AxiosError(message);
  error.response = {
    data: { message },
    status,
    statusText: String(status),
    headers: {},
    config: { headers: {} as never },
  };
  return error;
}

async function fillAndSubmit(fields: { email?: string; password?: string }) {
  const user = userEvent.setup();
  if (fields.email)    await user.type(screen.getByLabelText('E-mail'), fields.email);
  if (fields.password) await user.type(screen.getByLabelText('Senha'), fields.password);
  await user.click(screen.getByRole('button', { name: /entrar/i }));
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('LoginForm — renderização', () => {
  it('renders email, password fields and submit button', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });
});

describe('LoginForm — login bem-sucedido', () => {
  it('saves token to localStorage and redirects to /home', async () => {
    mockPost.mockResolvedValue({
      data: { message: 'Login bem-sucedido, bem-vindo!', token: 'jwt-token' },
    });

    render(<LoginForm />);
    await fillAndSubmit({ email: 'caio@test.com', password: 'secret123' });

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('jwt-token');
      expect(mockPush).toHaveBeenCalledWith('/home');
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('LoginForm — erros de validação (400)', () => {
  it('shows "O campo email é obrigatório" when backend returns 400', async () => {
    mockPost.mockRejectedValue(createAxiosError(400, 'O campo email é obrigatório'));

    render(<LoginForm />);
    await fillAndSubmit({ password: 'secret123' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('O campo email é obrigatório');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows "O campo password é obrigatório" when backend returns 400', async () => {
    mockPost.mockRejectedValue(createAxiosError(400, 'O campo password é obrigatório'));

    render(<LoginForm />);
    await fillAndSubmit({ email: 'caio@test.com' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('O campo password é obrigatório');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('LoginForm — credenciais inválidas (401)', () => {
  it('shows "E-mail ou senha incorretos" when backend returns 401', async () => {
    mockPost.mockRejectedValue(
      createAxiosError(401, 'E-mail ou senha incorretos, tente novamente')
    );

    render(<LoginForm />);
    await fillAndSubmit({ email: 'caio@test.com', password: 'wrong' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'E-mail ou senha incorretos, tente novamente'
      );
    });
    expect(mockPush).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('LoginForm — erro de rede', () => {
  it('shows generic error on network failure', async () => {
    mockPost.mockRejectedValue(new Error('Network Error'));

    render(<LoginForm />);
    await fillAndSubmit({ email: 'caio@test.com', password: 'secret123' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Erro inesperado. Tente novamente.');
    });
    expect(localStorage.getItem('token')).toBeNull();
  });
});
