import { NotificationModel } from '../../../../infra/mongo/schemas/notification.schema';
import { NotificationRepositoryPort, NotificationRecord } from '../../port/notification-repository.port';

export class NotificationRepository implements NotificationRepositoryPort {
  async create(data: { owner: string; task: string; message: string }): Promise<void> {
    await NotificationModel.create(data);
  }

  async findByIdAndOwner(id: string, ownerId: string): Promise<NotificationRecord | null> {
    const doc = await NotificationModel.findOne({ _id: id, owner: ownerId }).lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      owner: doc.owner.toString(),
      task: doc.task.toString(),
      message: doc.message,
      read: doc.read,
      createdAt: doc.createdAt,
    };
  }

  async markAsRead(id: string): Promise<void> {
    await NotificationModel.findByIdAndUpdate(id, { read: true });
  }

  async listByOwner(ownerId: string): Promise<NotificationRecord[]> {
    const docs = await NotificationModel.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();
    return docs.map(doc => ({
      id: doc._id.toString(),
      owner: doc.owner.toString(),
      task: doc.task.toString(),
      message: doc.message,
      read: doc.read,
      createdAt: doc.createdAt,
    }));
  }
}
