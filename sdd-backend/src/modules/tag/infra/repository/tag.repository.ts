import { TagModel } from '../../../../infra/mongo/schemas/tag.schema';
import { TagRepositoryPort } from '../../port/tag-repository.port';
import { CreateTagDTO } from '../../dto/create-tag.dto';

export class TagRepository implements TagRepositoryPort {
  async create(data: CreateTagDTO): Promise<void> {
    await TagModel.create(data);
  }

  async findByOwner(owner: string): Promise<{ color: string }[]> {
    return TagModel.find({ owner }).select('color').lean() as Promise<{ color: string }[]>;
  }
}
