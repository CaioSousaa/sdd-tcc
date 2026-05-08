import { TagService, InvalidTagColorError, ColorAlreadyInUseError, TagNotFoundError } from '../services/tag.service';
import { TagRepositoryPort } from '../port/tag-repository.port';

describe('TagService — RF5 e RF6 (Lógica de Negócio)', () => {
  let mockRepository: jest.Mocked<TagRepositoryPort>;
  let service: TagService;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByOwner: jest.fn(),
      findAllByOwner: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;
    service = new TagService(mockRepository);
    jest.clearAllMocks();
  });

  describe('listTags', () => {
    it('deve chamar o repositório com o ownerId correto', async () => {
      mockRepository.findAllByOwner.mockResolvedValue([]);
      await service.listTags('user-123');
      expect(mockRepository.findAllByOwner).toHaveBeenCalledWith('user-123');
    });
  });

  describe('updateTag', () => {
    const existingTag = {
      id: 'tag-1',
      name: 'Trabalho',
      color: '#F59E0B',
      owner: 'user-1',
    };

    it('deve lançar TagNotFoundError se a tag não existir', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.updateTag('invalid', 'user-1', { name: 'Novo' }))
        .rejects.toThrow(TagNotFoundError);
    });

    it('deve lançar TagNotFoundError se a tag pertencer a outro usuário', async () => {
      mockRepository.findById.mockResolvedValue(existingTag);
      await expect(service.updateTag('tag-1', 'user-outro', { name: 'Novo' }))
        .rejects.toThrow(TagNotFoundError);
    });

    it('deve permitir atualizar apenas o nome sem validar cor', async () => {
      mockRepository.findById.mockResolvedValue(existingTag);
      await service.updateTag('tag-1', 'user-1', { name: 'Novo Nome' });
      
      expect(mockRepository.update).toHaveBeenCalledWith('tag-1', { name: 'Novo Nome' });
      expect(mockRepository.findByOwner).not.toHaveBeenCalled();
    });

    it('deve validar a cor se ela for alterada', async () => {
      mockRepository.findById.mockResolvedValue(existingTag);
      mockRepository.findByOwner.mockResolvedValue([{ color: '#F59E0B' }]); // Cor atual em uso (permitido)
      
      await service.updateTag('tag-1', 'user-1', { color: '#EF4444' });
      
      expect(mockRepository.findByOwner).toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalledWith('tag-1', { color: '#EF4444' });
    });

    it('deve lançar ColorAlreadyInUseError se a nova cor já estiver em outra tag do usuário', async () => {
      mockRepository.findById.mockResolvedValue(existingTag);
      mockRepository.findByOwner.mockResolvedValue([
        { color: '#F59E0B' }, // Cor da própria tag
        { color: '#EF4444' }, // Cor de OUTRA tag
      ]);
      
      await expect(service.updateTag('tag-1', 'user-1', { color: '#EF4444' }))
        .rejects.toThrow(ColorAlreadyInUseError);
    });
  });

  describe('deleteTag', () => {
    it('deve deletar a tag se ela existir e pertencer ao usuário', async () => {
      mockRepository.findById.mockResolvedValue({ id: 't1', owner: 'u1', name: 'N', color: 'C' });
      await service.deleteTag('t1', 'u1');
      expect(mockRepository.delete).toHaveBeenCalledWith('t1');
    });

    it('deve lançar TagNotFoundError ao tentar deletar tag de outro usuário', async () => {
      mockRepository.findById.mockResolvedValue({ id: 't1', owner: 'u2', name: 'N', color: 'C' });
      await expect(service.deleteTag('t1', 'u1')).rejects.toThrow(TagNotFoundError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
