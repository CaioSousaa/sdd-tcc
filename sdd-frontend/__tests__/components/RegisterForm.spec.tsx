import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import RegisterForm from '@/components/RegisterForm';
import api from '@/lib/axios';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

const mockPost = (api as { post: jest.Mock }).post;

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

async function fillAndSubmit(fields: { name?: string; email?: string; password?: string }) {
  const user = userEvent.setup();
  if (fields.name)     await user.type(screen.getByLabelText('Nome'), fields.name);
  if (fields.email)    await user.type(screen.getByLabelText('E-mail'), fields.email);
  if (fields.password) await user.type(screen.getByLabelText('Senha'), fields.password);
  await user.click(screen.getByRole('button', { name: /criar conta/i }));
}

beforeEach(() => jest.clearAllMocks());

describe('RegisterForm — renderização', () => {
  it('renders all form fields and submit button', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });
});

describe('RegisterForm — cadastro bem-sucedido', () => {
  it('redirects to /login after successful registration (201)', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Usuário cadastrado com sucesso' } });

    render(<RegisterForm />);
    await fillAndSubmit({ name: 'Caio', email: 'caio@test.com', password: 'secret123' });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('RegisterForm — erros de validação (400)', () => {
  it('shows "O campo name é obrigatório" when backend returns 400', async () => {
    mockPost.mockRejectedValue(createAxiosError(400, 'O campo name é obrigatório'));

    render(<RegisterForm />);
    await fillAndSubmit({ email: 'caio@test.com', password: 'secret123' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('O campo name é obrigatório');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows "O campo email é obrigatório" when backend returns 400', async () => {
    mockPost.mockRejectedValue(createAxiosError(400, 'O campo email é obrigatório'));

    render(<RegisterForm />);
    await fillAndSubmit({ name: 'Caio', password: 'secret123' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('O campo email é obrigatório');
    });
  });

  it('shows "O campo password é obrigatório" when backend returns 400', async () => {
    mockPost.mockRejectedValue(createAxiosError(400, 'O campo password é obrigatório'));

    render(<RegisterForm />);
    await fillAndSubmit({ name: 'Caio', email: 'caio@test.com' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('O campo password é obrigatório');
    });
  });
});

describe('RegisterForm — e-mail duplicado (409)', () => {
  it('shows "E-mail já cadastrado" when backend returns 409', async () => {
    mockPost.mockRejectedValue(
      createAxiosError(409, 'E-mail já cadastrado, por favor tente outro')
    );

    render(<RegisterForm />);
    await fillAndSubmit({ name: 'Caio', email: 'caio@test.com', password: 'secret123' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'E-mail já cadastrado, por favor tente outro'
      );
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('RegisterForm — erro de rede', () => {
  it('shows generic error message on network failure', async () => {
    mockPost.mockRejectedValue(new Error('Network Error'));

    render(<RegisterForm />);
    await fillAndSubmit({ name: 'Caio', email: 'caio@test.com', password: 'secret123' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Erro inesperado. Tente novamente.');
    });
  });
});
