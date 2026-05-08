import { TaskService, TagNotFoundError } from '../services/task.service';
import { TaskRepositoryPort } from '../port/task-repository.port';
import { TagRepositoryPort } from '../../tag/port/tag-repository.port';
import { CreateTagDTO } from '../../tag/dto/create-tag.dto';

const mockTaskRepository: jest.Mocked<TaskRepositoryPort> = {
  create: jest.fn(),
};

const mockTagRepository: jest.Mocked<TagRepositoryPort> = {
  create: jest.fn(),
  findByOwner: jest.fn(),
  findAllByOwner: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const service = new TaskService(mockTaskRepository, mockTagRepository);

const BASE_DTO = {
  title: 'Minha tarefa',
  description: 'Descrição',
  status: 'todo',
  priority: 'high',
  dueDate: '2025-12-31',
  tags: [] as string[],
};

const TAG = { id: 'tag-1', name: 'Work', color: '#F59E0B', owner: 'user-1' };

beforeEach(() => jest.clearAllMocks());

// ─── Validação de tags ─────────────────────────────────────────────────────

describe('TaskService.createTask — validação de tags', () => {
  it('creates the task without calling findById when tags array is empty', async () => {
    await service.createTask({ ...BASE_DTO, tags: [] }, 'user-1');

    expect(mockTagRepository.findById).not.toHaveBeenCalled();
    expect(mockTaskRepository.create).toHaveBeenCalledTimes(1);
  });

  it('throws TagNotFoundError when tag does not exist', async () => {
    mockTagRepository.findById.mockResolvedValue(null);

    await expect(
      service.createTask({ ...BASE_DTO, tags: ['nonexistent-tag'] }, 'user-1'),
    ).rejects.toThrow(TagNotFoundError);

    expect(mockTaskRepository.create).not.toHaveBeenCalled();
  });

  it('throws TagNotFoundError when tag belongs to another user', async () => {
    mockTagRepository.findById.mockResolvedValue({ ...TAG, owner: 'other-user' });

    await expect(
      service.createTask({ ...BASE_DTO, tags: ['tag-1'] }, 'user-1'),
    ).rejects.toThrow(TagNotFoundError);

    expect(mockTaskRepository.create).not.toHaveBeenCalled();
  });

  it('throws TagNotFoundError with the correct message', async () => {
    mockTagRepository.findById.mockResolvedValue(null);

    await expect(
      service.createTask({ ...BASE_DTO, tags: ['tag-x'] }, 'user-1'),
    ).rejects.toThrow('Tag não encontrada');
  });

  it('throws on the first invalid tag and stops processing', async () => {
    mockTagRepository.findById.mockResolvedValueOnce(null);

    await expect(
      service.createTask({ ...BASE_DTO, tags: ['bad-tag', 'tag-1'] }, 'user-1'),
    ).rejects.toThrow(TagNotFoundError);

    expect(mockTagRepository.findById).toHaveBeenCalledTimes(1);
    expect(mockTagRepository.findById).toHaveBeenCalledWith('bad-tag');
  });

  it('validates all tags and creates the task when all are valid', async () => {
    const tag2 = { id: 'tag-2', name: 'Personal', color: '#EF4444', owner: 'user-1' };
    mockTagRepository.findById
      .mockResolvedValueOnce(TAG)
      .mockResolvedValueOnce(tag2);

    await service.createTask({ ...BASE_DTO, tags: ['tag-1', 'tag-2'] }, 'user-1');

    expect(mockTagRepository.findById).toHaveBeenCalledTimes(2);
    expect(mockTaskRepository.create).toHaveBeenCalledTimes(1);
  });
});

// ─── Criação da tarefa ─────────────────────────────────────────────────────

describe('TaskService.createTask — criação', () => {
  it('calls taskRepository.create with owner injected from userId', async () => {
    await service.createTask(BASE_DTO, 'user-1');

    expect(mockTaskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ owner: 'user-1' }),
    );
  });

  it('passes all DTO fields to the repository', async () => {
    await service.createTask(BASE_DTO, 'user-1');

    expect(mockTaskRepository.create).toHaveBeenCalledWith({
      ...BASE_DTO,
      owner: 'user-1',
    });
  });

  it('includes alert in the repository call when provided', async () => {
    await service.createTask({ ...BASE_DTO, alert: '2025-12-31T09:00:00' }, 'user-1');

    expect(mockTaskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ alert: '2025-12-31T09:00:00' }),
    );
  });

  it('creates the task with the correct tag when tag belongs to the user', async () => {
    mockTagRepository.findById.mockResolvedValue(TAG);

    await service.createTask({ ...BASE_DTO, tags: ['tag-1'] }, 'user-1');

    expect(mockTaskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['tag-1'], owner: 'user-1' }),
    );
  });
});
