import { Request, Response } from 'express';
import { UserServicePort } from '../../port/user-service.port';
import { DuplicateEmailError, NoFieldsToUpdateError, WeakPasswordError } from '../../services/user.service';

const REQUIRED_FIELDS = ['name', 'email', 'password'] as const;
type RequiredField = (typeof REQUIRED_FIELDS)[number];

export class UserController {
  constructor(private readonly userService: UserServicePort) {}

  async update(req: Request, res: Response): Promise<void> {
    const { name, password } = req.body;
    try {
      await this.userService.updateUser(req.userId!, { name, password });
      res.status(200).json({ message: 'Dados atualizados com sucesso' });
    } catch (error) {
      if (error instanceof NoFieldsToUpdateError) {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error instanceof WeakPasswordError) {
        res.status(400).json({ message: error.message });
        return;
      }
      throw error;
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    for (const field of REQUIRED_FIELDS) {
      if (!req.body[field]) {
        res.status(400).json({ message: `O campo ${field} é obrigatório` });
        return;
      }
    }

    const { name, email, password } = req.body as Record<RequiredField, string>;

    try {
      const { token } = await this.userService.createUser({ name, email, password });
      res.status(201).json({ message: 'Usuário cadastrado com sucesso', token });
    } catch (error) {
      if (error instanceof DuplicateEmailError) {
        res.status(409).json({ message: error.message });
        return;
      }
      throw error;
    }
  }
}
