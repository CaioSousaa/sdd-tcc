import bcrypt from 'bcrypt';
import { UserRepositoryPort } from '../port/user-repository.port';
import { UserServicePort } from '../port/user-service.port';
import { CreateUserDTO } from '../dto/create-user.dto';
import { signToken } from '../../../config/jwt';

export class DuplicateEmailError extends Error {
  constructor() {
    super('E-mail já cadastrado, por favor tente outro');
    this.name = 'DuplicateEmailError';
  }
}

export class UserService implements UserServicePort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async createUser(data: CreateUserDTO): Promise<{ token: string }> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new DuplicateEmailError();

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const created = await this.userRepository.create({ ...data, password: hashedPassword });
    return { token: signToken(created._id.toString()) };
  }
}
