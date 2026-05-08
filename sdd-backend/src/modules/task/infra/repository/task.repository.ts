import { TaskModel } from '../../../../infra/mongo/schemas/task.schema';
import { TaskRepositoryPort } from '../../port/task-repository.port';
import { CreateTaskDTO } from '../../dto/create-task.dto';

export class TaskRepository implements TaskRepositoryPort {
  async create(data: CreateTaskDTO & { owner: string }): Promise<void> {
    await TaskModel.create(data as any);
  }
}
