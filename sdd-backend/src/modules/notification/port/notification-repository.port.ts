export interface NotificationRecord {
  id: string;
  owner: string;
  task: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface NotificationRepositoryPort {
  create(data: { owner: string; task: string; message: string }): Promise<void>;
  findByIdAndOwner(id: string, ownerId: string): Promise<NotificationRecord | null>;
  markAsRead(id: string): Promise<void>;
  listByOwner(ownerId: string): Promise<NotificationRecord[]>;
}
