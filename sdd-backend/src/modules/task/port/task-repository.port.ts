import { CreateTaskDTO } from '../dto/create-task.dto';
import { UpdateTaskDTO } from '../dto/update-task.dto';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  owner: string;
  tags: string[];
  alert?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskRepositoryPort {
  create(data: CreateTaskDTO & { owner: string }): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findAllByOwner(owner: string): Promise<Task[]>;
  update(id: string, data: UpdateTaskDTO): Promise<Task | null>;
  delete(id: string): Promise<void>;
}

