import { UserRepository } from '../../user/infra/repository/user.repository';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../infra/controllers/auth.controller';

export function makeAuthController(): AuthController {
  const repository = new UserRepository();
  const service = new AuthService(repository);
  return new AuthController(service);
}
