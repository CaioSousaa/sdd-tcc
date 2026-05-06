import { Request, Response } from 'express';
import { AuthServicePort } from '../../port/auth-service.port';
import { InvalidCredentialsError } from '../../../../shared/errors/invalid-credentials.error';

export class AuthController {
  constructor(private readonly authService: AuthServicePort) {}

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email) {
      res.status(400).json({ message: 'O campo email é obrigatório' });
      return;
    }
    if (!password) {
      res.status(400).json({ message: 'O campo password é obrigatório' });
      return;
    }

    try {
      const { token } = await this.authService.login({ email, password });
      res.status(201).json({ message: 'Login bem-sucedido, bem-vindo!', token });
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        res.status(401).json({ message: error.message });
        return;
      }
      throw error;
    }
  }
}
