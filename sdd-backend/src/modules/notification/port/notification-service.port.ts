import { NotificationRecord } from './notification-repository.port';

export interface NotificationServicePort {
  createFromAlert(taskId: string, ownerId: string): Promise<void>;
  markAsRead(id: string, ownerId: string): Promise<void>;
  listNotifications(ownerId: string): Promise<NotificationRecord[]>;
}
