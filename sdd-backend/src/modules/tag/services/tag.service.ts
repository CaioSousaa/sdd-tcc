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
}
