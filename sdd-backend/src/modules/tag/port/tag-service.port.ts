import { CreateTagDTO } from '../dto/create-tag.dto';

export interface TagServicePort {
  createTag(data: CreateTagDTO): Promise<void>;
  listTags(owner: string): Promise<{ id: string, name: string, color: string }[]>;
  updateTag(tagId: string, owner: string, data: Partial<{ name: string, color: string }>): Promise<void>;
  deleteTag(tagId: string, owner: string): Promise<void>;
}
