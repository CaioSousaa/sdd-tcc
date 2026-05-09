import bcrypt from 'bcrypt';
import { UserRepositoryPort } from '../port/user-repository.port';
import { UserServicePort } from '../port/user-service.port';
import { CreateUserDTO } from '../dto/create-user.dto';
import { signToken } from '../../../config/jwt';

export class NoFieldsToUpdateError extends Error {
  constructor() {
    super('Nenhum campo para atualizar foi informado');
    this.name = 'NoFieldsToUpdateError';
  }
}

export class WeakPasswordError extends Error {
  constructor() {
    super('A senha deve ter no mínimo 8 caracteres');
    this.name = 'WeakPasswordError';
  }
}

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

  async updateUser(userId: string, data: { name?: string; password?: string }): Promise<void> {
    if (!data.name && !data.password) throw new NoFieldsToUpdateError();

    const update: { name?: string; password?: string } = {};
    if (data.name) update.name = data.name;
    if (data.password) {
      if (data.password.length < 8) throw new WeakPasswordError();
      update.password = await bcrypt.hash(data.password, 10);
    }

    await this.userRepository.update(userId, update);
  }
}
