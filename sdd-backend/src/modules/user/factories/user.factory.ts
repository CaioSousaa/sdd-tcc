import { UserRepository } from '../infra/repository/user.repository';
import { UserService } from '../services/user.service';
import { UserController } from '../infra/controllers/user.controller';

export function makeUserController(): UserController {
  const repository = new UserRepository();
  const service = new UserService(repository);
  return new UserController(service);
}
