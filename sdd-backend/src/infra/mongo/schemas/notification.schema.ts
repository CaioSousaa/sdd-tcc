import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  owner: Types.ObjectId;
  task: Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    owner:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    task:    { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    message: { type: String, required: true },
    read:    { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const NotificationModel = model<INotification>('Notification', notificationSchema);
