import { Request, Response } from 'express';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../../../config/taskEnums';
import { TaskServicePort } from '../../port/task-service.port';
import { TagNotFoundError, TaskNotFoundError, InvalidPriorityError } from '../../services/task.service';

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

  async list(req: Request, res: Response): Promise<void> {
    try {
      const filters: { priority?: string; tags?: string[] } = {};
      
      if (req.query.priority) {
        filters.priority = req.query.priority as string;
      }
      
      if (req.query.tags) {
        filters.tags = Array.isArray(req.query.tags) 
          ? req.query.tags as string[] 
          : (req.query.tags as string).split(',');
      }

      const tasks = await this.taskService.listTasks(req.userId!, filters);
      res.status(200).json(tasks);
    } catch (error) {
      if (error instanceof InvalidPriorityError || error instanceof TagNotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'erro interno do servidor' });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const { taskId } = req.params as { taskId: string };
    const { status, priority } = req.body;

    if (status && !TASK_STATUSES.includes(status)) {
      res.status(400).json({ message: 'Status inválido' });
      return;
    }

    if (priority && !TASK_PRIORITIES.includes(priority)) {
      res.status(400).json({ message: 'Prioridade inválida' });
      return;
    }

    try {
      const task = await this.taskService.updateTask(taskId, req.userId!, req.body);
      res.status(200).json({ message: 'Tarefa editada com sucesso', task });
    } catch (error) {
      if (error instanceof TaskNotFoundError || error instanceof TagNotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'erro interno do servidor' });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { taskId } = req.params as { taskId: string };

    try {
      await this.taskService.deleteTask(taskId, req.userId!);
      res.status(200).json({ message: 'Tarefa deletada com sucesso' });
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'erro interno do servidor' });
      }
    }
  }
}

