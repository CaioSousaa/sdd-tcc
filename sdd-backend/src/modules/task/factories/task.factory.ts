import { TagRepository } from '../../tag/infra/repository/tag.repository';
import { TaskRepository } from '../infra/repository/task.repository';
import { TaskService } from '../services/task.service';
import { TaskController } from '../infra/controllers/task.controller';
import { schedulerService } from '../../../infra/scheduler/scheduler.service';
import { notificationService } from '../../notification/factories/notification.factory';

export function makeTaskController(): TaskController {
  const taskRepository = new TaskRepository();
  const tagRepository = new TagRepository();
  const service = new TaskService(taskRepository, tagRepository, schedulerService, notificationService);
  return new TaskController(service);
}
