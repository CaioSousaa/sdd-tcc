import { TagRepositoryPort } from '../../tag/port/tag-repository.port';
import { TaskRepositoryPort } from '../port/task-repository.port';
import { TaskServicePort } from '../port/task-service.port';
import { CreateTaskDTO } from '../dto/create-task.dto';

export class TagNotFoundError extends Error {
  constructor() {
    super('Tag não encontrada');
    this.name = 'TagNotFoundError';
  }
}

export class TaskService implements TaskServicePort {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly tagRepository: TagRepositoryPort,
  ) {}

  async createTask(data: CreateTaskDTO, userId: string): Promise<void> {
    for (const tagId of data.tags) {
      const tag = await this.tagRepository.findById(tagId);
      if (!tag || tag.owner !== userId) throw new TagNotFoundError();
    }
    await this.taskRepository.create({ ...data, owner: userId });
  }
}
