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

  async findAllByOwner(owner: string): Promise<{ id: string, name: string, color: string }[]> {
    const tags = await TagModel.find({ owner }).select('name color').lean();
    return tags.map((t: any) => ({
      id: t._id.toString(),
      name: t.name,
      color: t.color,
    }));
  }

  async findById(id: string): Promise<{ id: string, name: string, color: string, owner: string } | null> {
    try {
      const tag = await TagModel.findById(id).lean();
      if (!tag) return null;
      return {
        id: tag._id.toString(),
        name: tag.name,
        color: tag.color,
        owner: tag.owner.toString(),
      };
    } catch {
      return null;
    }
  }

  async update(id: string, data: Partial<{ name: string, color: string }>): Promise<void> {
    await TagModel.updateOne({ _id: id }, data);
  }

  async delete(id: string): Promise<void> {
    await TagModel.deleteOne({ _id: id });
  }

  async findTagsByIdsAndOwner(tagIds: string[], userId: string): Promise<{ id: string, name: string, color: string }[]> {
    const tags = await TagModel.find({ _id: { $in: tagIds }, owner: userId }).select('name color').lean();
    return tags.map((t: any) => ({
      id: t._id.toString(),
      name: t.name,
      color: t.color,
    }));
  }
}
