import { Request, Response } from 'express';
import { TagServicePort } from '../../port/tag-service.port';
import { InvalidTagColorError, ColorAlreadyInUseError } from '../../services/tag.service';

export class TagController {
  constructor(private readonly tagService: TagServicePort) {}

  async create(req: Request, res: Response): Promise<void> {
    const { name, color } = req.body;

    if (!name) {
      res.status(400).json({ message: 'o name é obrigatório' });
      return;
    }
    if (!color) {
      res.status(400).json({ message: 'o color é obrigatório' });
      return;
    }

    try {
      await this.tagService.createTag({ name, color, owner: req.userId! });
      res.status(201).json({ message: 'tag criada com sucesso' });
    } catch (error) {
      if (error instanceof InvalidTagColorError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof ColorAlreadyInUseError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'erro interno do servidor' });
      }
    }
  }
}
