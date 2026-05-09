import { TaskModel } from '../../../../infra/mongo/schemas/task.schema';
import { TaskRepositoryPort, Task } from '../../port/task-repository.port';
import { CreateTaskDTO } from '../../dto/create-task.dto';
import { UpdateTaskDTO } from '../../dto/update-task.dto';

export class TaskRepository implements TaskRepositoryPort {
  private mapToTask(task: any): Task {
    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      owner: task.owner.toString(),
      tags: task.tags.map((tag: any) => tag.toString()),
      alert: task.alert,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  async create(data: CreateTaskDTO & { owner: string }): Promise<void> {
    await TaskModel.create(data as any);
  }

  async findById(id: string): Promise<Task | null> {
    const task = await TaskModel.findById(id);
    return task ? this.mapToTask(task) : null;
  }

  async findAllByOwner(owner: string, filters?: { priority?: string; tags?: string[] }): Promise<Task[]> {
    const query: any = { owner };
    
    if (filters?.priority) {
      query.priority = filters.priority;
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $all: filters.tags };
    }

    const tasks = await TaskModel.find(query);
    return tasks.map(task => this.mapToTask(task));
  }

  async update(id: string, data: UpdateTaskDTO): Promise<Task | null> {
    const task = await TaskModel.findByIdAndUpdate(id, data, { new: true });
    return task ? this.mapToTask(task) : null;
  }

  async delete(id: string): Promise<void> {
    await TaskModel.findByIdAndDelete(id);
  }
}

