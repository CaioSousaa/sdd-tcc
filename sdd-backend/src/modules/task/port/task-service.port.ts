import { CreateTaskDTO } from '../dto/create-task.dto';
import { UpdateTaskDTO } from '../dto/update-task.dto';
import { Task } from './task-repository.port';

export interface TaskServicePort {
  createTask(data: CreateTaskDTO, userId: string): Promise<void>;
  updateTask(taskId: string, userId: string, data: UpdateTaskDTO): Promise<Task>;
  deleteTask(taskId: string, userId: string): Promise<void>;
  listTasks(userId: string, filters?: { priority?: string; tags?: string[] }): Promise<Task[]>;
}

