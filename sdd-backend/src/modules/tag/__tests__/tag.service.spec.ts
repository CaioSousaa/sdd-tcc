import { TagService, InvalidTagColorError, ColorAlreadyInUseError } from '../services/tag.service';
import { TagRepositoryPort } from '../port/tag-repository.port';

const mockRepository: jest.Mocked<TagRepositoryPort> = {
  create: jest.fn(),
  findByOwner: jest.fn(),
};

const service = new TagService(mockRepository);

beforeEach(() => jest.clearAllMocks());

describe('TagService.createTag — validação de cor', () => {
  it('throws InvalidTagColorError when color is not in the catalog', async () => {
    await expect(
      service.createTag({ name: 'Work', color: '#000000', owner: 'user-1' })
    ).rejects.toThrow(InvalidTagColorError);

    expect(mockRepository.findByOwner).not.toHaveBeenCalled();
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('throws ColorAlreadyInUseError when the color is already used by the user', async () => {
    mockRepository.findByOwner.mockResolvedValue([{ color: '#F59E0B' }]);

    await expect(
      service.createTag({ name: 'Work', color: '#F59E0B', owner: 'user-1' })
    ).rejects.toThrow(ColorAlreadyInUseError);

    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('does not check owner colors when color is not in catalog', async () => {
    await expect(
      service.createTag({ name: 'Work', color: '#ZZZZZZ', owner: 'user-1' })
    ).rejects.toThrow(InvalidTagColorError);

    expect(mockRepository.findByOwner).not.toHaveBeenCalled();
  });
});

describe('TagService.createTag — criação bem-sucedida', () => {
  it('creates the tag when color is valid and not yet used', async () => {
    mockRepository.findByOwner.mockResolvedValue([]);

    await service.createTag({ name: 'Work', color: '#F59E0B', owner: 'user-1' });

    expect(mockRepository.create).toHaveBeenCalledWith({
      name: 'Work',
      color: '#F59E0B',
      owner: 'user-1',
    });
  });

  it('creates the tag when user has other colors but not the requested one', async () => {
    mockRepository.findByOwner.mockResolvedValue([
      { color: '#EF4444' },
      { color: '#22C55E' },
    ]);

    await service.createTag({ name: 'Personal', color: '#F59E0B', owner: 'user-1' });

    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it('queries only the owner colors when checking availability', async () => {
    mockRepository.findByOwner.mockResolvedValue([]);

    await service.createTag({ name: 'Work', color: '#3B82F6', owner: 'user-42' });

    expect(mockRepository.findByOwner).toHaveBeenCalledWith('user-42');
  });
});
