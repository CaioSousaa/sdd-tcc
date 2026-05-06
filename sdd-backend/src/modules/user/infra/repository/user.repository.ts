import { UserModel } from '../../../../infra/mongo/schemas/user.schema';
import { UserRepositoryPort } from '../../port/user-repository.port';
import { CreateUserDTO } from '../../dto/create-user.dto';

export class UserRepository implements UserRepositoryPort {
  async findByEmail(email: string): Promise<{ email: string } | null> {
    return UserModel.findOne({ email }).select('email').lean();
  }

  async create(data: CreateUserDTO & { password: string }): Promise<void> {
    await UserModel.create(data);
  }
}
