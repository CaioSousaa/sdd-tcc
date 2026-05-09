import { TaskService, TagNotFoundError, InvalidPriorityError } from '../services/task.service';
import { TaskRepositoryPort } from '../port/task-repository.port';
import { TagRepositoryPort } from '../../tag/port/tag-repository.port';
import { SchedulerServicePort } from '../port/scheduler-service.port';
import { NotificationServicePort } from '../../notification/port/notification-service.port';

const mockTaskRepository: jest.Mocked<TaskRepositoryPort> = {
  create: jest.fn(),
  findById: jest.fn(),
  findAllByOwner: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockTagRepository: jest.Mocked<TagRepositoryPort> = {
  create: jest.fn(),
  findByOwner: jest.fn(),
  findAllByOwner: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findTagsByIdsAndOwner: jest.fn(),
};

const mockScheduler: jest.Mocked<SchedulerServicePort> = {
  schedule: jest.fn(),
  cancel: jest.fn(),
};

const mockNotificationService: jest.Mocked<NotificationServicePort> = {
  createFromAlert: jest.fn(),
};

const service = new TaskService(mockTaskRepository, mockTagRepository, mockScheduler, mockNotificationService);

beforeEach(() => jest.clearAllMocks());

describe('TaskService.listTasks (RF11)', () => {
  it('should list all tasks when no filters are provided', async () => {
    mockTaskRepository.findAllByOwner.mockResolvedValue([]);
    await service.listTasks('user-1');
    expect(mockTaskRepository.findAllByOwner).toHaveBeenCalledWith('user-1', undefined);
  });

  it('should list tasks filtering by priority', async () => {
    mockTaskRepository.findAllByOwner.mockResolvedValue([]);
    await service.listTasks('user-1', { priority: 'high' });
    expect(mockTaskRepository.findAllByOwner).toHaveBeenCalledWith('user-1', { priority: 'high' });
  });

  it('should throw InvalidPriorityError when priority is invalid', async () => {
    await expect(service.listTasks('user-1', { priority: 'invalid_prio' })).rejects.toThrow(InvalidPriorityError);
    expect(mockTaskRepository.findAllByOwner).not.toHaveBeenCalled();
  });

  it('should throw TagNotFoundError when any tag does not belong to user or does not exist', async () => {
    mockTagRepository.findTagsByIdsAndOwner.mockResolvedValue([{ id: 'tag1', name: 't1', color: 'c1' }]); // returned only 1 instead of 2
    await expect(service.listTasks('user-1', { tags: ['tag1', 'tag2'] })).rejects.toThrow(TagNotFoundError);
    expect(mockTagRepository.findTagsByIdsAndOwner).toHaveBeenCalledWith(['tag1', 'tag2'], 'user-1');
    expect(mockTaskRepository.findAllByOwner).not.toHaveBeenCalled();
  });

  it('should list tasks filtering by valid tags', async () => {
    mockTagRepository.findTagsByIdsAndOwner.mockResolvedValue([
      { id: 'tag1', name: 't1', color: 'c1' },
      { id: 'tag2', name: 't2', color: 'c2' },
    ]);
    mockTaskRepository.findAllByOwner.mockResolvedValue([]);
    
    await service.listTasks('user-1', { tags: ['tag1', 'tag2'] });
    
    expect(mockTagRepository.findTagsByIdsAndOwner).toHaveBeenCalledWith(['tag1', 'tag2'], 'user-1');
    expect(mockTaskRepository.findAllByOwner).toHaveBeenCalledWith('user-1', { tags: ['tag1', 'tag2'] });
  });

  it('should list tasks filtering by priority and tags together', async () => {
    mockTagRepository.findTagsByIdsAndOwner.mockResolvedValue([{ id: 'tag1', name: 't1', color: 'c1' }]);
    mockTaskRepository.findAllByOwner.mockResolvedValue([]);
    
    await service.listTasks('user-1', { priority: 'low', tags: ['tag1'] });
    
    expect(mockTagRepository.findTagsByIdsAndOwner).toHaveBeenCalledWith(['tag1'], 'user-1');
    expect(mockTaskRepository.findAllByOwner).toHaveBeenCalledWith('user-1', { priority: 'low', tags: ['tag1'] });
  });
});
