import { Request, Response } from 'express';
import { TaskController } from '../infra/controllers/task.controller';
import { TaskServicePort } from '../port/task-service.port';
import { TagNotFoundError } from '../services/task.service';

function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(body: object, userId = 'user-1'): Request {
  return { body, userId } as unknown as Request;
}

const VALID_BODY = {
  title: 'Minha tarefa',
  description: 'Descrição da tarefa',
  status: 'todo',
  priority: 'high',
  dueDate: '2025-12-31',
  tags: [],
};

const mockService: jest.Mocked<TaskServicePort> = {
  createTask: jest.fn(),
};

const controller = new TaskController(mockService);

beforeEach(() => jest.clearAllMocks());

// ─── Campos obrigatórios ───────────────────────────────────────────────────

describe('TaskController.create — campos obrigatórios', () => {
  const requiredFields: Array<{ field: string; rest: object }> = [
    { field: 'title',       rest: { description: 'D', status: 'todo', priority: 'low', dueDate: '2025-01-01' } },
    { field: 'description', rest: { title: 'T',       status: 'todo', priority: 'low', dueDate: '2025-01-01' } },
    { field: 'status',      rest: { title: 'T', description: 'D',     priority: 'low', dueDate: '2025-01-01' } },
    { field: 'priority',    rest: { title: 'T', description: 'D', status: 'todo',      dueDate: '2025-01-01' } },
    { field: 'dueDate',     rest: { title: 'T', description: 'D', status: 'todo', priority: 'low' } },
  ];

  for (const { field, rest } of requiredFields) {
    it(`returns 400 when ${field} is missing`, async () => {
      const res = mockRes();

      await controller.create(mockReq(rest), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: `O campo ${field} é obrigatório` });
      expect(mockService.createTask).not.toHaveBeenCalled();
    });
  }

  it('returns title error first when all fields are missing', async () => {
    const res = mockRes();

    await controller.create(mockReq({}), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'O campo title é obrigatório' });
    expect(mockService.createTask).not.toHaveBeenCalled();
  });

  it('returns description error when only title is present', async () => {
    const res = mockRes();

    await controller.create(mockReq({ title: 'T' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'O campo description é obrigatório' });
  });
});

// ─── Validação de enums ────────────────────────────────────────────────────

describe('TaskController.create — validação de enums', () => {
  it('returns 400 when status is invalid', async () => {
    const res = mockRes();

    await controller.create(
      mockReq({ ...VALID_BODY, status: 'invalid' }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Status inválido' });
    expect(mockService.createTask).not.toHaveBeenCalled();
  });

  it('returns 400 when priority is invalid', async () => {
    const res = mockRes();

    await controller.create(
      mockReq({ ...VALID_BODY, priority: 'urgent' }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Prioridade inválida' });
    expect(mockService.createTask).not.toHaveBeenCalled();
  });

  it('returns status error before priority error', async () => {
    const res = mockRes();

    await controller.create(
      mockReq({ ...VALID_BODY, status: 'bad', priority: 'also-bad' }),
      res,
    );

    expect(res.json).toHaveBeenCalledWith({ message: 'Status inválido' });
  });

  it('accepts all valid status values', async () => {
    mockService.createTask.mockResolvedValue(undefined);

    for (const status of ['todo', 'in_progress', 'done']) {
      const res = mockRes();
      await controller.create(mockReq({ ...VALID_BODY, status }), res);
      expect(res.status).toHaveBeenCalledWith(201);
    }
  });

  it('accepts all valid priority values', async () => {
    mockService.createTask.mockResolvedValue(undefined);

    for (const priority of ['low', 'medium', 'high']) {
      const res = mockRes();
      await controller.create(mockReq({ ...VALID_BODY, priority }), res);
      expect(res.status).toHaveBeenCalledWith(201);
    }
  });
});

// ─── Delegação ao service ──────────────────────────────────────────────────

describe('TaskController.create — delegação ao service', () => {
  it('returns 201 with success message on valid request', async () => {
    mockService.createTask.mockResolvedValue(undefined);
    const res = mockRes();

    await controller.create(mockReq(VALID_BODY), res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Tarefa criada com sucesso' });
  });

  it('passes req.userId as the second argument to the service', async () => {
    mockService.createTask.mockResolvedValue(undefined);
    const res = mockRes();

    await controller.create(mockReq(VALID_BODY, 'user-42'), res);

    expect(mockService.createTask).toHaveBeenCalledWith(
      expect.any(Object),
      'user-42',
    );
  });

  it('passes an empty array for tags when tags is not provided', async () => {
    mockService.createTask.mockResolvedValue(undefined);
    const res = mockRes();
    const { tags: _tags, ...bodyWithoutTags } = VALID_BODY;

    await controller.create(mockReq(bodyWithoutTags), res);

    expect(mockService.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ tags: [] }),
      expect.any(String),
    );
  });

  it('forwards alert to the service when provided', async () => {
    mockService.createTask.mockResolvedValue(undefined);
    const res = mockRes();

    await controller.create(mockReq({ ...VALID_BODY, alert: '2025-12-31T09:00:00' }), res);

    expect(mockService.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ alert: '2025-12-31T09:00:00' }),
      expect.any(String),
    );
  });
});

// ─── Mapeamento de erros ───────────────────────────────────────────────────

describe('TaskController.create — mapeamento de erros', () => {
  it('returns 400 when service throws TagNotFoundError', async () => {
    mockService.createTask.mockRejectedValue(new TagNotFoundError());
    const res = mockRes();

    await controller.create(mockReq(VALID_BODY), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Tag não encontrada' });
  });

  it('returns 500 on unexpected error', async () => {
    mockService.createTask.mockRejectedValue(new Error('db offline'));
    const res = mockRes();

    await controller.create(mockReq(VALID_BODY), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'erro interno do servidor' });
  });
});
