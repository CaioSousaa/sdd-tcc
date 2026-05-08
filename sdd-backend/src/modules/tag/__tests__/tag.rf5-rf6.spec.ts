import { Request, Response } from 'express';
import { TagController } from '../infra/controllers/tag.controller';
import { TagServicePort } from '../port/tag-service.port';
import { TagNotFoundError, InvalidTagColorError, ColorAlreadyInUseError } from '../services/tag.service';

function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(params: any = {}, body: any = {}, userId = 'user-1'): Request {
  return { params, body, userId } as unknown as Request;
}

describe('TagController — RF5 e RF6 (Listagem, Edição e Exclusão)', () => {
  let mockService: jest.Mocked<TagServicePort>;
  let controller: TagController;

  beforeEach(() => {
    mockService = {
      createTag: jest.fn(),
      listTags: jest.fn(),
      updateTag: jest.fn(),
      deleteTag: jest.fn(),
    };
    controller = new TagController(mockService);
    jest.clearAllMocks();
  });

  describe('Visualização (RF5 - GET /tags)', () => {
    it('deve retornar status 200 e a lista de tags do usuário', async () => {
      const tags = [
        { id: '1', name: 'Tag 1', color: '#F59E0B' },
        { id: '2', name: 'Tag 2', color: '#EF4444' },
      ];
      mockService.listTags.mockResolvedValue(tags);
      const res = mockRes();

      await controller.list(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(tags);
      expect(mockService.listTags).toHaveBeenCalledWith('user-1');
    });

    it('deve retornar status 500 em caso de erro inesperado no serviço', async () => {
      mockService.listTags.mockRejectedValue(new Error('DB Error'));
      const res = mockRes();

      await controller.list(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'erro interno do servidor' });
    });
  });

  describe('Edição (RF6 - PATCH /tags/:tagId)', () => {
    const validId = '663a8c3d9a1b2c3d4e5f6g7h';

    it('deve retornar 200 e mensagem de sucesso ao editar validamente', async () => {
      mockService.updateTag.mockResolvedValue(undefined);
      const res = mockRes();
      const body = { name: 'Novo Nome', color: '#3B82F6' };

      await controller.update(mockReq({ tagId: validId }, body), res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Tag editada com sucesso',
        name: 'Novo Nome',
      }));
    });

    it('deve retornar 400 quando a tag não existe ou não pertence ao usuário', async () => {
      mockService.updateTag.mockRejectedValue(new TagNotFoundError());
      const res = mockRes();

      await controller.update(mockReq({ tagId: 'invalid-id' }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tag não encontrada' });
    });

    it('deve retornar 400 quando a nova cor é inválida (fora do catálogo)', async () => {
      mockService.updateTag.mockRejectedValue(new InvalidTagColorError());
      const res = mockRes();

      await controller.update(mockReq({ tagId: validId }, { color: '#000000' }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'cor inválida' });
    });

    it('deve retornar 400 quando a nova cor já está em uso por outra tag', async () => {
      mockService.updateTag.mockRejectedValue(new ColorAlreadyInUseError());
      const res = mockRes();

      await controller.update(mockReq({ tagId: validId }, { color: '#EF4444' }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'esta cor já está em uso' });
    });
  });

  describe('Exclusão (RF6 - DELETE /tags/:tagId)', () => {
    const validId = '663a8c3d9a1b2c3d4e5f6g7h';

    it('deve retornar 200 e mensagem de sucesso ao deletar validamente', async () => {
      mockService.deleteTag.mockResolvedValue(undefined);
      const res = mockRes();

      await controller.delete(mockReq({ tagId: validId }), res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tag deletada' });
    });

    it('deve retornar 400 quando a tag a ser deletada não existe', async () => {
      mockService.deleteTag.mockRejectedValue(new TagNotFoundError());
      const res = mockRes();

      await controller.delete(mockReq({ tagId: 'non-existent' }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tag não encontrada' });
    });
  });
});
