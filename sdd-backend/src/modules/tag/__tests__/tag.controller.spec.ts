import { Request, Response } from 'express';
import { TagController } from '../infra/controllers/tag.controller';
import { TagServicePort } from '../port/tag-service.port';
import { InvalidTagColorError, ColorAlreadyInUseError } from '../services/tag.service';

function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(body: object, userId = 'user-1'): Request {
  return { body, userId } as unknown as Request;
}

const mockService: jest.Mocked<TagServicePort> = {
  createTag: jest.fn(),
  listTags: jest.fn(),
  updateTag: jest.fn(),
  deleteTag: jest.fn(),
};

const controller = new TagController(mockService);

beforeEach(() => jest.clearAllMocks());

describe('TagController.create — validação de campos obrigatórios', () => {
  it('returns 400 when name is missing', async () => {
    const res = mockRes();

    await controller.create(mockReq({ color: '#F59E0B' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'o name é obrigatório' });
    expect(mockService.createTag).not.toHaveBeenCalled();
  });

  it('returns 400 when color is missing', async () => {
    const res = mockRes();

    await controller.create(mockReq({ name: 'Work' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'o color é obrigatório' });
    expect(mockService.createTag).not.toHaveBeenCalled();
  });

  it('returns 400 for name first when both fields are missing', async () => {
    const res = mockRes();

    await controller.create(mockReq({}), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'o name é obrigatório' });
    expect(mockService.createTag).not.toHaveBeenCalled();
  });
});

describe('TagController.create — respostas de negócio', () => {
  it('returns 201 with success message on valid request', async () => {
    mockService.createTag.mockResolvedValue(undefined);
    const res = mockRes();

    await controller.create(mockReq({ name: 'Work', color: '#F59E0B' }), res);

    expect(mockService.createTag).toHaveBeenCalledWith({
      name: 'Work',
      color: '#F59E0B',
      owner: 'user-1',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'tag criada com sucesso' });
  });

  it('passes req.userId as owner to the service', async () => {
    mockService.createTag.mockResolvedValue(undefined);
    const res = mockRes();

    await controller.create(mockReq({ name: 'Work', color: '#F59E0B' }, 'user-99'), res);

    expect(mockService.createTag).toHaveBeenCalledWith(
      expect.objectContaining({ owner: 'user-99' })
    );
  });

  it('returns 400 when service throws InvalidTagColorError', async () => {
    mockService.createTag.mockRejectedValue(new InvalidTagColorError());
    const res = mockRes();

    await controller.create(mockReq({ name: 'Work', color: '#000000' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'cor inválida' });
  });

  it('returns 400 when service throws ColorAlreadyInUseError', async () => {
    mockService.createTag.mockRejectedValue(new ColorAlreadyInUseError());
    const res = mockRes();

    await controller.create(mockReq({ name: 'Work', color: '#F59E0B' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'esta cor já está em uso' });
  });

  it('returns 500 on unexpected error', async () => {
    mockService.createTag.mockRejectedValue(new Error('db connection lost'));
    const res = mockRes();

    await controller.create(mockReq({ name: 'Work', color: '#F59E0B' }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'erro interno do servidor' });
  });
});
