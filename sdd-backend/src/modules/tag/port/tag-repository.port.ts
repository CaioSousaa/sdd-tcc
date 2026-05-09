import { CreateTagDTO } from '../dto/create-tag.dto';

export interface TagRepositoryPort {
  create(data: CreateTagDTO): Promise<void>;
  findByOwner(owner: string): Promise<{ color: string }[]>;
  findAllByOwner(owner: string): Promise<{ id: string, name: string, color: string }[]>;
  findById(id: string): Promise<{ id: string, name: string, color: string, owner: string } | null>;
  update(id: string, data: Partial<{ name: string, color: string }>): Promise<void>;
  delete(id: string): Promise<void>;
  findTagsByIdsAndOwner(tagIds: string[], userId: string): Promise<{ id: string, name: string, color: string }[]>;
}
