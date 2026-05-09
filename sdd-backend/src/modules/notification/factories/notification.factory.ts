import { NotificationRepository } from '../infra/repository/notification.repository';
import { NotificationService } from '../services/notification.service';
import { NotificationController } from '../infra/controllers/notification.controller';

const repository = new NotificationRepository();
export const notificationService = new NotificationService(repository);
export const notificationController = new NotificationController(notificationService);
