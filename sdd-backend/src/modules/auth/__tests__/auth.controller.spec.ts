import { Request, Response } from 'express';
import { AuthController } from '../infra/controllers/auth.controller';
import { AuthServicePort } from '../port/auth-service.port';
import { InvalidCredentialsError } from '../../../shared/errors/invalid-credentials.error';

function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const mockService: jest.Mocked<AuthServicePort> = {
  login: jest.fn(),
  logout: jest.fn(),
};

const controller = new AuthController(mockService);

beforeEach(() => jest.clearAllMocks());

describe('AuthController.login — validação de campos obrigatórios', () => {
  it('returns 400 when email is missing', async () => {
    const req = { body: { password: 'secret123' } } as Request;
    const res = mockRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'O campo email é obrigatório' });
    expect(mockService.login).not.toHaveBeenCalled();
  });

  it('returns 400 when password is missing', async () => {
    const req = { body: { email: 'caio@test.com' } } as Request;
    const res = mockRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'O campo password é obrigatório' });
    expect(mockService.login).not.toHaveBeenCalled();
  });

  it('returns 400 when body is empty', async () => {
    const req = { body: {} } as Request;
    const res = mockRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockService.login).not.toHaveBeenCalled();
  });
});

describe('AuthController.login — respostas de negócio', () => {
  it('returns 201 with message and token on successful login', async () => {
    mockService.login.mockResolvedValue({ token: 'jwt-token' });
    const req = { body: { email: 'caio@test.com', password: 'secret123' } } as Request;
    const res = mockRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Login bem-sucedido, bem-vindo!',
      token: 'jwt-token',
    });
  });

  it('returns 401 when credentials are invalid', async () => {
    mockService.login.mockRejectedValue(new InvalidCredentialsError());
    const req = { body: { email: 'caio@test.com', password: 'wrong' } } as Request;
    const res = mockRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'E-mail ou senha incorretos, tente novamente',
    });
  });
});
