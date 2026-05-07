import { Schema, model, Document, Types } from 'mongoose';

export interface ITag extends Document {
  name: string;
  color: string;
  owner: Types.ObjectId;
  createdAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    name:  { type: String, required: true },
    color: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TagModel = model<ITag>('Tag', tagSchema);
