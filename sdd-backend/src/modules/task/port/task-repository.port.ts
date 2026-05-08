import { CreateTaskDTO } from '../dto/create-task.dto';

export interface TaskRepositoryPort {
  create(data: CreateTaskDTO & { owner: string }): Promise<void>;
}
