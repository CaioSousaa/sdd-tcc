import { TagRepositoryPort } from '../../tag/port/tag-repository.port';
import { TaskRepositoryPort, Task } from '../port/task-repository.port';
import { TaskServicePort } from '../port/task-service.port';
import { CreateTaskDTO } from '../dto/create-task.dto';
import { UpdateTaskDTO } from '../dto/update-task.dto';

export class TagNotFoundError extends Error {
  constructor() {
    super('Tag não encontrada');
    this.name = 'TagNotFoundError';
  }
}

export class TaskNotFoundError extends Error {
  constructor() {
    super('Tarefa não encontrada');
    this.name = 'TaskNotFoundError';
  }
}

export class InvalidPriorityError extends Error {
  constructor() {
    super('Prioridade inválida');
    this.name = 'InvalidPriorityError';
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

  async listTasks(userId: string, filters?: { priority?: string; tags?: string[] }): Promise<Task[]> {
    if (filters?.priority && !['low', 'medium', 'high'].includes(filters.priority)) {
      throw new InvalidPriorityError();
    }

    if (filters?.tags && filters.tags.length > 0) {
      const tags = await this.tagRepository.findTagsByIdsAndOwner(filters.tags, userId);
      if (tags.length !== filters.tags.length) {
        throw new TagNotFoundError();
      }
    }

    return this.taskRepository.findAllByOwner(userId, filters);
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskDTO): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.owner !== userId) {
      throw new TaskNotFoundError();
    }

    if (data.tags) {
      for (const tagId of data.tags) {
        const tag = await this.tagRepository.findById(tagId);
        if (!tag || tag.owner !== userId) throw new TagNotFoundError();
      }
    }

    const updatedTask = await this.taskRepository.update(taskId, data);
    if (!updatedTask) throw new TaskNotFoundError();

    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.owner !== userId) {
      throw new TaskNotFoundError();
    }

    await this.taskRepository.delete(taskId);
  }
}

