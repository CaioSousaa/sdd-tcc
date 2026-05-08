import { TagRepository } from '../../tag/infra/repository/tag.repository';
import { TaskRepository } from '../infra/repository/task.repository';
import { TaskService } from '../services/task.service';
import { TaskController } from '../infra/controllers/task.controller';

export function makeTaskController(): TaskController {
  const taskRepository = new TaskRepository();
  const tagRepository = new TagRepository();
  const service = new TaskService(taskRepository, tagRepository);
  return new TaskController(service);
}
