import { TagRepository } from '../infra/repository/tag.repository';
import { TagService } from '../services/tag.service';
import { TagController } from '../infra/controllers/tag.controller';

export function makeTagController(): TagController {
  const repository = new TagRepository();
  const service = new TagService(repository);
  return new TagController(service);
}
