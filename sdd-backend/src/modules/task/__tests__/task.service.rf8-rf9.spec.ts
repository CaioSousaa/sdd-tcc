import { TaskService, TagNotFoundError, TaskNotFoundError } from '../services/task.service';
import { TaskRepositoryPort, Task } from '../port/task-repository.port';
import { TagRepositoryPort } from '../../tag/port/tag-repository.port';

const mockTaskRepository: jest.Mocked<TaskRepositoryPort> = {
    create: jest.fn(),
    findById: jest.fn(),
    findAllByOwner: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

const mockTagRepository: jest.Mocked<TagRepositoryPort> = {
    create: jest.fn(),
    findByOwner: jest.fn(),
    findAllByOwner: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findTagsByIdsAndOwner: jest.fn(),
};

const service = new TaskService(mockTaskRepository, mockTagRepository);

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

const TAG = { id: 'tag-1', name: 'Work', color: '#F59E0B', owner: 'user-1' };

beforeEach(() => jest.clearAllMocks());

describe('TaskService — RF8 e RF9 (Listagem, Edição e Exclusão)', () => {

    // ─── listTasks ───────────────────────────────────────────────────────────

    describe('listTasks', () => {
        it('deve chamar findAllByOwner com o userId informado', async () => {
            mockTaskRepository.findAllByOwner.mockResolvedValue([TASK]);

            await service.listTasks('user-1');

            expect(mockTaskRepository.findAllByOwner).toHaveBeenCalledWith('user-1');
        });

        it('deve retornar as tarefas retornadas pelo repositório', async () => {
            mockTaskRepository.findAllByOwner.mockResolvedValue([TASK]);

            const result = await service.listTasks('user-1');

            expect(result).toEqual([TASK]);
        });

        it('deve retornar array vazio quando o usuário não tem tarefas', async () => {
            mockTaskRepository.findAllByOwner.mockResolvedValue([]);

            const result = await service.listTasks('user-1');

            expect(result).toEqual([]);
        });
    });

    // ─── updateTask — validações ─────────────────────────────────────────────

    describe('updateTask — validações', () => {
        it('deve lançar TaskNotFoundError quando a tarefa não existe', async () => {
            mockTaskRepository.findById.mockResolvedValue(null);

            await expect(
                service.updateTask('task-1', 'user-1', { title: 'X' }),
            ).rejects.toThrow(TaskNotFoundError);

            expect(mockTaskRepository.update).not.toHaveBeenCalled();
        });

        it('deve lançar TaskNotFoundError quando a tarefa pertence a outro usuário', async () => {
            mockTaskRepository.findById.mockResolvedValue({ ...TASK, owner: 'outro-usuario' });

            await expect(
                service.updateTask('task-1', 'user-1', { title: 'X' }),
            ).rejects.toThrow(TaskNotFoundError);

            expect(mockTaskRepository.update).not.toHaveBeenCalled();
        });

        it('deve lançar TagNotFoundError quando uma tag no update não existe', async () => {
            mockTaskRepository.findById.mockResolvedValue(TASK);
            mockTagRepository.findById.mockResolvedValue(null);

            await expect(
                service.updateTask('task-1', 'user-1', { tags: ['tag-inexistente'] }),
            ).rejects.toThrow(TagNotFoundError);

            expect(mockTaskRepository.update).not.toHaveBeenCalled();
        });

        it('deve lançar TagNotFoundError quando uma tag no update pertence a outro usuário', async () => {
            mockTaskRepository.findById.mockResolvedValue(TASK);
            mockTagRepository.findById.mockResolvedValue({ ...TAG, owner: 'outro-usuario' });

            await expect(
                service.updateTask('task-1', 'user-1', { tags: ['tag-1'] }),
            ).rejects.toThrow(TagNotFoundError);
        });

        it('não deve validar tags quando o campo tags está ausente do update', async () => {
            mockTaskRepository.findById.mockResolvedValue(TASK);
            mockTaskRepository.update.mockResolvedValue(TASK);

            await service.updateTask('task-1', 'user-1', { title: 'Novo título' });

            expect(mockTagRepository.findById).not.toHaveBeenCalled();
        });

        it('deve lançar TaskNotFoundError quando o repositório retorna null após update', async () => {
            mockTaskRepository.findById.mockResolvedValue(TASK);
            mockTaskRepository.update.mockResolvedValue(null);

            await expect(
                service.updateTask('task-1', 'user-1', { title: 'X' }),
            ).rejects.toThrow(TaskNotFoundError);
        });
    });

    // ─── updateTask — atualização ────────────────────────────────────────────

    describe('updateTask — atualização', () => {
        it('deve retornar a tarefa atualizada em caso de sucesso', async () => {
            const updated = { ...TASK, title: 'Atualizado', status: 'done' as const };
            mockTaskRepository.findById.mockResolvedValue(TASK);
            mockTaskRepository.update.mockResolvedValue(updated);

            const result = await service.updateTask('task-1', 'user-1', { title: 'Atualizado', status: 'done' });

            expect(result).toEqual(updated);
        });

        it('deve chamar repository.update com o taskId e os dados corretos', async () => {
            mockTaskRepository.findById.mockResolvedValue(TASK);
            mockTaskRepository.update.mockResolvedValue(TASK);

            await service.updateTask('task-1', 'user-1', { status: 'done' });

            expect(mockTaskRepository.update).toHaveBeenCalledWith('task-1', { status: 'done' });
        });

        it('deve validar todas as tags e atualizar quando todas são válidas', async () => {
            const tag2 = { ...TAG, id: 'tag-2' };
            mockTaskRepository.findById.mockResolvedValue(TASK);
            mockTagRepository.findById
                .mockResolvedValueOnce(TAG)
                .mockResolvedValueOnce(tag2);
            mockTaskRepository.update.mockResolvedValue(TASK);

            await service.updateTask('task-1', 'user-1', { tags: ['tag-1', 'tag-2'] });

            expect(mockTagRepository.findById).toHaveBeenCalledTimes(2);
            expect(mockTaskRepository.update).toHaveBeenCalledTimes(1);
        });
    });

    // ─── deleteTask ──────────────────────────────────────────────────────────

    describe('deleteTask', () => {
        it('deve lançar TaskNotFoundError quando a tarefa não existe', async () => {
            mockTaskRepository.findById.mockResolvedValue(null);

            await expect(service.deleteTask('task-1', 'user-1')).rejects.toThrow(TaskNotFoundError);

            expect(mockTaskRepository.delete).not.toHaveBeenCalled();
        });

        it('deve lançar TaskNotFoundError quando a tarefa pertence a outro usuário', async () => {
            mockTaskRepository.findById.mockResolvedValue({ ...TASK, owner: 'outro-usuario' });

            await expect(service.deleteTask('task-1', 'user-1')).rejects.toThrow(TaskNotFoundError);

            expect(mockTaskRepository.delete).not.toHaveBeenCalled();
        });

        it('deve chamar repository.delete com o taskId correto', async () => {
            mockTaskRepository.findById.mockResolvedValue(TASK);
            mockTaskRepository.delete.mockResolvedValue(undefined);

            await service.deleteTask('task-1', 'user-1');

            expect(mockTaskRepository.delete).toHaveBeenCalledWith('task-1');
        });

        it('deve resolver sem erros quando a tarefa existe e pertence ao usuário', async () => {
            mockTaskRepository.findById.mockResolvedValue(TASK);
            mockTaskRepository.delete.mockResolvedValue(undefined);

            await expect(service.deleteTask('task-1', 'user-1')).resolves.toBeUndefined();
        });
    });
});
