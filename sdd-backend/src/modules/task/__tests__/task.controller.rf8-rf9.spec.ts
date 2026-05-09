import { Request, Response } from 'express';
import { TaskController } from '../infra/controllers/task.controller';
import { TaskServicePort } from '../port/task-service.port';
import { Task } from '../port/task-repository.port';
import { TagNotFoundError, TaskNotFoundError } from '../services/task.service';

function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(body: object = {}, userId = 'user-1', params: object = {}, query: object = {}): Request {
  return { body, userId, params, query } as unknown as Request;
}

const TASK: Task = {
  id: 'task-1',
  title: 'Minha tarefa',
  description: 'Descrição',
  status: 'todo',
  priority: 'high',
  dueDate: new Date('2025-12-31'),
  owner: 'user-1',
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TaskController — RF8 e RF9 (Edição, Listagem e Exclusão)', () => {
  let mockService: jest.Mocked<TaskServicePort>;
  let controller: TaskController;

  beforeEach(() => {
    mockService = {
      createTask: jest.fn(),
      listTasks: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    };
    controller = new TaskController(mockService);
    jest.clearAllMocks();
  });

  // ─── Listagem (GET /tasks) ───────────────────────────────────────────────

  describe('Listagem (RF10 - GET /tasks)', () => {
    it('deve retornar 200 com a lista de tarefas do usuário', async () => {
      mockService.listTasks.mockResolvedValue([TASK]);
      const res = mockRes();

      await controller.list(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([TASK]);
    });

    it('deve passar o userId do token para o service', async () => {
      mockService.listTasks.mockResolvedValue([]);
      const res = mockRes();

      await controller.list(mockReq({}, 'user-99'), res);

      expect(mockService.listTasks).toHaveBeenCalledWith('user-99', {});
    });

    it('deve retornar array vazio quando o usuário não tem tarefas', async () => {
      mockService.listTasks.mockResolvedValue([]);
      const res = mockRes();

      await controller.list(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('deve retornar 500 em caso de erro inesperado', async () => {
      mockService.listTasks.mockRejectedValue(new Error('db error'));
      const res = mockRes();

      await controller.list(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'erro interno do servidor' });
    });
  });

  // ─── Edição — validação de enums (PATCH /tasks/:taskId) ─────────────────

  describe('Edição — validação de enums (RF8 - PATCH /tasks/:taskId)', () => {
    it('deve retornar 400 quando status enviado é inválido', async () => {
      const res = mockRes();

      await controller.update(mockReq({ status: 'invalido' }, 'user-1', { taskId: 'task-1' }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Status inválido' });
      expect(mockService.updateTask).not.toHaveBeenCalled();
    });

    it('deve retornar 400 quando priority enviada é inválida', async () => {
      const res = mockRes();

      await controller.update(mockReq({ priority: 'urgente' }, 'user-1', { taskId: 'task-1' }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Prioridade inválida' });
      expect(mockService.updateTask).not.toHaveBeenCalled();
    });

    it('não deve validar status quando ele está ausente do body', async () => {
      mockService.updateTask.mockResolvedValue(TASK);
      const res = mockRes();

      await controller.update(mockReq({ title: 'Novo título' }, 'user-1', { taskId: 'task-1' }), res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('não deve validar priority quando ela está ausente do body', async () => {
      mockService.updateTask.mockResolvedValue(TASK);
      const res = mockRes();

      await controller.update(mockReq({ status: 'done' }, 'user-1', { taskId: 'task-1' }), res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve aceitar todos os valores válidos de status', async () => {
      mockService.updateTask.mockResolvedValue(TASK);

      for (const status of ['todo', 'in_progress', 'done']) {
        const res = mockRes();
        await controller.update(mockReq({ status }, 'user-1', { taskId: 'task-1' }), res);
        expect(res.status).toHaveBeenCalledWith(200);
      }
    });

    it('deve aceitar todos os valores válidos de priority', async () => {
      mockService.updateTask.mockResolvedValue(TASK);

      for (const priority of ['low', 'medium', 'high']) {
        const res = mockRes();
        await controller.update(mockReq({ priority }, 'user-1', { taskId: 'task-1' }), res);
        expect(res.status).toHaveBeenCalledWith(200);
      }
    });
  });

  // ─── Edição — delegação e erros ─────────────────────────────────────────

  describe('Edição — delegação e erros (RF8)', () => {
    it('deve retornar 200 com mensagem e tarefa atualizada em caso de sucesso', async () => {
      const updated = { ...TASK, title: 'Atualizado' };
      mockService.updateTask.mockResolvedValue(updated);
      const res = mockRes();

      await controller.update(mockReq({ title: 'Atualizado' }, 'user-1', { taskId: 'task-1' }), res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tarefa editada com sucesso', task: updated });
    });

    it('deve passar taskId e userId corretamente para o service', async () => {
      mockService.updateTask.mockResolvedValue(TASK);
      const res = mockRes();

      await controller.update(mockReq({ title: 'X' }, 'user-7', { taskId: 'task-99' }), res);

      expect(mockService.updateTask).toHaveBeenCalledWith('task-99', 'user-7', expect.any(Object));
    });

    it('deve retornar 400 quando o service lança TaskNotFoundError', async () => {
      mockService.updateTask.mockRejectedValue(new TaskNotFoundError());
      const res = mockRes();

      await controller.update(mockReq({ title: 'X' }, 'user-1', { taskId: 'inexistente' }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tarefa não encontrada' });
    });

    it('deve retornar 400 quando o service lança TagNotFoundError', async () => {
      mockService.updateTask.mockRejectedValue(new TagNotFoundError());
      const res = mockRes();

      await controller.update(mockReq({ tags: ['tag-invalida'] }, 'user-1', { taskId: 'task-1' }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tag não encontrada' });
    });

    it('deve retornar 500 em caso de erro inesperado', async () => {
      mockService.updateTask.mockRejectedValue(new Error('db error'));
      const res = mockRes();

      await controller.update(mockReq({ title: 'X' }, 'user-1', { taskId: 'task-1' }), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'erro interno do servidor' });
    });
  });

  // ─── Exclusão (DELETE /tasks/:taskId) ───────────────────────────────────

  describe('Exclusão (RF9 - DELETE /tasks/:taskId)', () => {
    it('deve retornar 200 com mensagem de sucesso ao deletar', async () => {
      mockService.deleteTask.mockResolvedValue(undefined);
      const res = mockRes();

      await controller.delete(mockReq({}, 'user-1', { taskId: 'task-1' }), res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tarefa deletada com sucesso' });
    });

    it('deve passar taskId e userId corretamente para o service', async () => {
      mockService.deleteTask.mockResolvedValue(undefined);
      const res = mockRes();

      await controller.delete(mockReq({}, 'user-7', { taskId: 'task-99' }), res);

      expect(mockService.deleteTask).toHaveBeenCalledWith('task-99', 'user-7');
    });

    it('deve retornar 400 quando a tarefa não existe ou não pertence ao usuário', async () => {
      mockService.deleteTask.mockRejectedValue(new TaskNotFoundError());
      const res = mockRes();

      await controller.delete(mockReq({}, 'user-1', { taskId: 'inexistente' }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tarefa não encontrada' });
    });

    it('deve retornar 500 em caso de erro inesperado', async () => {
      mockService.deleteTask.mockRejectedValue(new Error('db error'));
      const res = mockRes();

      await controller.delete(mockReq({}, 'user-1', { taskId: 'task-1' }), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'erro interno do servidor' });
    });
  });
});
