import { Schema, model, Document, Types } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  owner: Types.ObjectId;
  tags: Types.ObjectId[];
  alert?: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title:       { type: String, required: true },
    description: { type: String, required: true },
    status:      { type: String, enum: ['todo', 'in_progress', 'done'], required: true },
    priority:    { type: String, enum: ['low', 'medium', 'high'], required: true },
    dueDate:     { type: Date, required: true },
    owner:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags:        [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    alert:       { type: String },
  },
  { timestamps: true },
);

export const TaskModel = model<ITask>('Task', taskSchema);
