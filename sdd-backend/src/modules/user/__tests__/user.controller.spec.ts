import { Request, Response } from 'express';
import { UserController } from '../infra/controllers/user.controller';
import { UserServicePort } from '../port/user-service.port';
import { DuplicateEmailError } from '../services/user.service';

function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const mockService: jest.Mocked<UserServicePort> = {
  createUser: jest.fn(),
};

const controller = new UserController(mockService);

beforeEach(() => jest.clearAllMocks());

describe('UserController.create — validação de campos obrigatórios', () => {
  it('returns 400 when name is missing', async () => {
    const req = { body: { email: 'a@b.com', password: 'x' } } as Request;
    const res = mockRes();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'O campo name é obrigatório' });
    expect(mockService.createUser).not.toHaveBeenCalled();
  });

  it('returns 400 when email is missing', async () => {
    const req = { body: { name: 'Caio', password: 'x' } } as Request;
    const res = mockRes();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'O campo email é obrigatório' });
    expect(mockService.createUser).not.toHaveBeenCalled();
  });

  it('returns 400 when password is missing', async () => {
    const req = { body: { name: 'Caio', email: 'a@b.com' } } as Request;
    const res = mockRes();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'O campo password é obrigatório' });
    expect(mockService.createUser).not.toHaveBeenCalled();
  });
});

describe('UserController.create — respostas de negócio', () => {
  it('returns 201 on successful registration', async () => {
    mockService.createUser.mockResolvedValue(undefined);
    const req = { body: { name: 'Caio', email: 'a@b.com', password: 'secret' } } as Request;
    const res = mockRes();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuário cadastrado com sucesso' });
  });

  it('returns 409 when email is already registered', async () => {
    mockService.createUser.mockRejectedValue(new DuplicateEmailError());
    const req = { body: { name: 'Caio', email: 'a@b.com', password: 'secret' } } as Request;
    const res = mockRes();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'E-mail já cadastrado, por favor tente outro',
    });
  });
});
