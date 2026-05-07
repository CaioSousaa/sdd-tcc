import { CreateTagDTO } from '../dto/create-tag.dto';

export interface TagRepositoryPort {
  create(data: CreateTagDTO): Promise<void>;
  findByOwner(owner: string): Promise<{ color: string }[]>;
}
