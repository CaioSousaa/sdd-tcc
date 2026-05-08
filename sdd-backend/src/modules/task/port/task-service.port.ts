import { CreateTaskDTO } from '../dto/create-task.dto';

export interface TaskServicePort {
  createTask(data: CreateTaskDTO, userId: string): Promise<void>;
}
