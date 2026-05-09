import { NotificationRepositoryPort, NotificationRecord } from '../port/notification-repository.port';
import { NotificationServicePort } from '../port/notification-service.port';
import { TaskModel } from '../../../infra/mongo/schemas/task.schema';
import { UserModel } from '../../../infra/mongo/schemas/user.schema';

export class NotificationNotFoundError extends Error {
  constructor() {
    super('Notificação não encontrada');
    this.name = 'NotificationNotFoundError';
  }
}

export class NotificationAlreadyReadError extends Error {
  constructor() {
    super('Notificação já marcada como lida');
    this.name = 'NotificationAlreadyReadError';
  }
}

export class NotificationService implements NotificationServicePort {
  constructor(private readonly notificationRepository: NotificationRepositoryPort) {}

  async createFromAlert(taskId: string, ownerId: string): Promise<void> {
    const task = await TaskModel.findById(taskId).lean();
    if (!task) return;

    const owner = await UserModel.findById(ownerId).lean();
    if (!owner) return;

    await this.notificationRepository.create({
      owner: ownerId,
      task: taskId,
      message: `Lembrete: a tarefa ${task.title} está aguardando sua atenção`,
    });
  }

  async markAsRead(id: string, ownerId: string): Promise<void> {
    const notification = await this.notificationRepository.findByIdAndOwner(id, ownerId);
    if (!notification) throw new NotificationNotFoundError();
    if (notification.read) throw new NotificationAlreadyReadError();
    await this.notificationRepository.markAsRead(id);
  }

  async listNotifications(ownerId: string): Promise<NotificationRecord[]> {
    return this.notificationRepository.listByOwner(ownerId);
  }
}
