import { CreateTagDTO } from '../dto/create-tag.dto';

export interface TagServicePort {
  createTag(data: CreateTagDTO): Promise<void>;
}
