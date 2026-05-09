export interface NotificationServicePort {
  createFromAlert(taskId: string, ownerId: string): Promise<void>;
}
