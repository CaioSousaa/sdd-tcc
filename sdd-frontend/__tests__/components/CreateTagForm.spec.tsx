import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import CreateTagForm from '@/components/CreateTagForm';
import api from '@/lib/axios';

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

const mockOnSuccess = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('CreateTagForm — renderização', () => {
  it('renders name field, color buttons and submit button', () => {
    render(<CreateTagForm />);

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar tag/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Amber' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cyan' })).toBeInTheDocument();
  });

  it('hides colors passed as unavailableColors', () => {
    render(<CreateTagForm unavailableColors={['#F59E0B', '#EF4444']} />);

    expect(screen.queryByRole('button', { name: 'Amber' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Red' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Green' })).toBeInTheDocument();
  });
});

describe('CreateTagForm — validação client-side', () => {
  it('shows error and does not call API when name is empty', async () => {
    const user = userEvent.setup();
    render(<CreateTagForm />);

    await user.click(screen.getByRole('button', { name: /criar tag/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('o name é obrigatório');
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('shows error and does not call API when color is not selected', async () => {
    const user = userEvent.setup();
    render(<CreateTagForm />);

    await user.type(screen.getByLabelText('Nome'), 'Trabalho');
    await user.click(screen.getByRole('button', { name: /criar tag/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('o color é obrigatório');
    expect(mockPost).not.toHaveBeenCalled();
  });
});

describe('CreateTagForm — criação bem-sucedida', () => {
  it('calls onSuccess and does not show error when API returns 201', async () => {
    mockPost.mockResolvedValue({ data: { message: 'tag criada com sucesso' } });
    const user = userEvent.setup();
    render(<CreateTagForm onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText('Nome'), 'Trabalho');
    await user.click(screen.getByRole('button', { name: 'Amber' }));
    await user.click(screen.getByRole('button', { name: /criar tag/i }));

    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('sends name and selected color to POST /tags', async () => {
    mockPost.mockResolvedValue({ data: { message: 'tag criada com sucesso' } });
    const user = userEvent.setup();
    render(<CreateTagForm />);

    await user.type(screen.getByLabelText('Nome'), 'Estudos');
    await user.click(screen.getByRole('button', { name: 'Blue' }));
    await user.click(screen.getByRole('button', { name: /criar tag/i }));

    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith('/tags', { name: 'Estudos', color: '#3B82F6' })
    );
  });
});

describe('CreateTagForm — erros da API (400)', () => {
  it('shows "cor inválida" when API returns 400 with that message', async () => {
    mockPost.mockRejectedValue(createAxiosError(400, 'cor inválida'));
    const user = userEvent.setup();
    render(<CreateTagForm />);

    await user.type(screen.getByLabelText('Nome'), 'Trabalho');
    await user.click(screen.getByRole('button', { name: 'Amber' }));
    await user.click(screen.getByRole('button', { name: /criar tag/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('cor inválida')
    );
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('shows "esta cor já está em uso" when API returns 400 with that message', async () => {
    mockPost.mockRejectedValue(createAxiosError(400, 'esta cor já está em uso'));
    const user = userEvent.setup();
    render(<CreateTagForm />);

    await user.type(screen.getByLabelText('Nome'), 'Trabalho');
    await user.click(screen.getByRole('button', { name: 'Amber' }));
    await user.click(screen.getByRole('button', { name: /criar tag/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('esta cor já está em uso')
    );
  });
});

describe('CreateTagForm — erro de rede', () => {
  it('shows generic error on network failure', async () => {
    mockPost.mockRejectedValue(new Error('Network Error'));
    const user = userEvent.setup();
    render(<CreateTagForm />);

    await user.type(screen.getByLabelText('Nome'), 'Trabalho');
    await user.click(screen.getByRole('button', { name: 'Amber' }));
    await user.click(screen.getByRole('button', { name: /criar tag/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Erro inesperado. Tente novamente.')
    );
  });
});
