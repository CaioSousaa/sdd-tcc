import { Request, Response } from 'express';
import { TagServicePort } from '../../port/tag-service.port';
import { InvalidTagColorError, ColorAlreadyInUseError, TagNotFoundError } from '../../services/tag.service';

export class TagController {
  constructor(private readonly tagService: TagServicePort) { }

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
    } catch (error: any) {
      if (error instanceof InvalidTagColorError || error instanceof ColorAlreadyInUseError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'erro interno do servidor' });
      }
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const tags = await this.tagService.listTags(req.userId!);
      res.status(200).json(tags);
    } catch (error) {
      res.status(500).json({ message: 'erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const { tagId } = req.params;
    const { name, color } = req.body;

    try {
      await this.tagService.updateTag(tagId as string, req.userId!, { name, color });
      res.status(200).json({
        id: tagId,
        name,
        color,
        message: 'Tag editada com sucesso',
      });
    } catch (error: any) {
      if (error instanceof TagNotFoundError || error instanceof InvalidTagColorError || error instanceof ColorAlreadyInUseError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'erro interno do servidor' });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { tagId } = req.params;

    try {
      await this.tagService.deleteTag(tagId as string, req.userId!);
      res.status(200).json({ message: 'Tag deletada' });
    } catch (error: any) {
      if (error instanceof TagNotFoundError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'erro interno do servidor' });
      }
    }
  }
}
