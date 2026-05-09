import { Request, Response } from 'express';
import { NotificationServicePort } from '../../port/notification-service.port';
import { NotificationNotFoundError, NotificationAlreadyReadError } from '../../services/notification.service';

export class NotificationController {
  constructor(private readonly notificationService: NotificationServicePort) {}

  async markAsRead(req: Request, res: Response): Promise<void> {
    const id = req.params['id'] as string;
    try {
      await this.notificationService.markAsRead(id, req.userId!);
      res.status(200).json({ message: 'Notificação marcada como lida' });
    } catch (error) {
      if (error instanceof NotificationNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error instanceof NotificationAlreadyReadError) {
        res.status(400).json({ message: error.message });
        return;
      }
      throw error;
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    const notifications = await this.notificationService.listNotifications(req.userId!);
    res.status(200).json(notifications);
  }
}
