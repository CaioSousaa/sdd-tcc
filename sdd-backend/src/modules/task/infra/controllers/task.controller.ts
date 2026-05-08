import { Request, Response } from 'express';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../../../config/taskEnums';
import { TaskServicePort } from '../../port/task-service.port';
import { TagNotFoundError } from '../../services/task.service';

const REQUIRED_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'] as const;

export class TaskController {
  constructor(private readonly taskService: TaskServicePort) {}

  async create(req: Request, res: Response): Promise<void> {
    for (const field of REQUIRED_FIELDS) {
      if (!req.body[field]) {
        res.status(400).json({ message: `O campo ${field} é obrigatório` });
        return;
      }
    }

    const { title, description, status, priority, dueDate, tags, alert } = req.body;

    if (!TASK_STATUSES.includes(status)) {
      res.status(400).json({ message: 'Status inválido' });
      return;
    }

    if (!TASK_PRIORITIES.includes(priority)) {
      res.status(400).json({ message: 'Prioridade inválida' });
      return;
    }

    try {
      await this.taskService.createTask(
        { title, description, status, priority, dueDate, tags: tags ?? [], alert },
        req.userId!,
      );
      res.status(201).json({ message: 'Tarefa criada com sucesso' });
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'erro interno do servidor' });
      }
    }
  }
}
