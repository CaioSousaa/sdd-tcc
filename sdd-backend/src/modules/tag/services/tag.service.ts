import { TAG_COLORS, TagColor } from '../../../config/tagColors';
import { TagRepositoryPort } from '../port/tag-repository.port';
import { TagServicePort } from '../port/tag-service.port';
import { CreateTagDTO } from '../dto/create-tag.dto';

export class InvalidTagColorError extends Error {
  constructor() {
    super('cor inválida');
    this.name = 'InvalidTagColorError';
  }
}

export class ColorAlreadyInUseError extends Error {
  constructor() {
    super('esta cor já está em uso');
    this.name = 'ColorAlreadyInUseError';
  }
}

export class TagNotFoundError extends Error {
  constructor() {
    super('Tag não encontrada');
    this.name = 'TagNotFoundError';
  }
}

export class TagService implements TagServicePort {
  constructor(private readonly tagRepository: TagRepositoryPort) {}

  async createTag(data: CreateTagDTO): Promise<void> {
    if (!TAG_COLORS.includes(data.color as TagColor)) {
      throw new InvalidTagColorError();
    }

    const existing = await this.tagRepository.findByOwner(data.owner);
    const usedColors = existing.map((t) => t.color);
    if (usedColors.includes(data.color)) {
      throw new ColorAlreadyInUseError();
    }

    await this.tagRepository.create(data);
  }

  async listTags(owner: string): Promise<{ id: string, name: string, color: string }[]> {
    return this.tagRepository.findAllByOwner(owner);
  }

  async updateTag(tagId: string, owner: string, data: Partial<{ name: string, color: string }>): Promise<void> {
    const tag = await this.tagRepository.findById(tagId);

    if (!tag || tag.owner !== owner) {
      throw new TagNotFoundError();
    }

    if (data.color && data.color !== tag.color) {
      if (!TAG_COLORS.includes(data.color as TagColor)) {
        throw new InvalidTagColorError();
      }

      const existing = await this.tagRepository.findByOwner(owner);
      const usedColors = existing.map((t) => t.color);
      if (usedColors.includes(data.color)) {
        throw new ColorAlreadyInUseError();
      }
    }

    await this.tagRepository.update(tagId, data);
  }

  async deleteTag(tagId: string, owner: string): Promise<void> {
    const tag = await this.tagRepository.findById(tagId);

    if (!tag || tag.owner !== owner) {
      throw new TagNotFoundError();
    }

    await this.tagRepository.delete(tagId);
  }
}
