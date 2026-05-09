import { NotificationServicePort } from '../port/notification-service.port';

export class NotificationService implements NotificationServicePort {
  async createFromAlert(_taskId: string, _ownerId: string): Promise<void> {
    // RF13: implementação a ser adicionada
  }
}

export const notificationService = new NotificationService();
