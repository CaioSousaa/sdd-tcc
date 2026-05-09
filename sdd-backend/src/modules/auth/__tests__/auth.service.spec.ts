import bcrypt from 'bcrypt';
import { AuthService } from '../services/auth.service';
import { UserRepositoryPort } from '../../user/port/user-repository.port';
import { InvalidCredentialsError } from '../../../shared/errors/invalid-credentials.error';

jest.mock('../../../config/jwt', () => ({
  signToken: jest.fn().mockReturnValue('mocked-jwt-token'),
}));

const mockRepository: jest.Mocked<UserRepositoryPort> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const service = new AuthService(mockRepository);

beforeEach(() => jest.clearAllMocks());

describe('AuthService.login — credenciais inválidas', () => {
  it('throws InvalidCredentialsError when email is not registered', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'unknown@test.com', password: 'any' })
    ).rejects.toThrow(InvalidCredentialsError);

    expect(mockRepository.findByEmail).toHaveBeenCalledWith('unknown@test.com');
  });

  it('throws InvalidCredentialsError when password does not match', async () => {
    const hashed = await bcrypt.hash('correct', 10);
    mockRepository.findByEmail.mockResolvedValue({
      _id: '123',
      email: 'caio@test.com',
      password: hashed,
    });

    await expect(
      service.login({ email: 'caio@test.com', password: 'wrong' })
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('throws the same error for wrong email and wrong password (no enumeration)', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    const errorWrongEmail = await service.login({ email: 'x@x.com', password: 'x' }).catch((e) => e);

    const hashed = await bcrypt.hash('correct', 10);
    mockRepository.findByEmail.mockResolvedValue({ _id: '1', email: 'x@x.com', password: hashed });
    const errorWrongPass = await service.login({ email: 'x@x.com', password: 'wrong' }).catch((e) => e);

    expect(errorWrongEmail).toBeInstanceOf(InvalidCredentialsError);
    expect(errorWrongPass).toBeInstanceOf(InvalidCredentialsError);
    expect(errorWrongEmail.message).toBe(errorWrongPass.message);
  });
});

describe('AuthService.login — login bem-sucedido', () => {
  it('returns a token when credentials are correct', async () => {
    const hashed = await bcrypt.hash('secret123', 10);
    mockRepository.findByEmail.mockResolvedValue({
      _id: 'user-id-123',
      email: 'caio@test.com',
      password: hashed,
    });

    const result = await service.login({ email: 'caio@test.com', password: 'secret123' });

    expect(result).toHaveProperty('token');
    expect(typeof result.token).toBe('string');
  });

  it('generates token with the user _id as subject', async () => {
    const { signToken } = await import('../../../config/jwt');
    const hashed = await bcrypt.hash('secret123', 10);
    mockRepository.findByEmail.mockResolvedValue({
      _id: 'user-id-123',
      email: 'caio@test.com',
      password: hashed,
    });

    await service.login({ email: 'caio@test.com', password: 'secret123' });

    expect(signToken).toHaveBeenCalledWith('user-id-123');
  });
});
