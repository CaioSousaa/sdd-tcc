import { UserService, DuplicateEmailError } from '../services/user.service';
import { UserRepositoryPort } from '../port/user-repository.port';

const mockRepository: jest.Mocked<UserRepositoryPort> = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const service = new UserService(mockRepository);

beforeEach(() => jest.clearAllMocks());

describe('UserService.createUser', () => {
  it('should create user and hash the password when email is not taken', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(undefined);

    await service.createUser({ name: 'Caio', email: 'caio@test.com', password: 'secret123' });

    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    const saved = mockRepository.create.mock.calls[0][0];
    expect(saved.password).not.toBe('secret123');
    expect(saved.password).toMatch(/^\$2b\$/);
  });

  it('should throw DuplicateEmailError when email is already registered', async () => {
    mockRepository.findByEmail.mockResolvedValue({ email: 'caio@test.com' });

    await expect(
      service.createUser({ name: 'Caio', email: 'caio@test.com', password: 'secret123' })
    ).rejects.toThrow(DuplicateEmailError);

    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
