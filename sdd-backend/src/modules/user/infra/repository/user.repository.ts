import { UserModel } from '../../../../infra/mongo/schemas/user.schema';
import { UserRepositoryPort, UserRecord } from '../../port/user-repository.port';
import { CreateUserDTO } from '../../dto/create-user.dto';

export class UserRepository implements UserRepositoryPort {
  async findByEmail(email: string): Promise<UserRecord | null> {
    return UserModel.findOne({ email }).select('_id email password').lean() as Promise<UserRecord | null>;
  }

  async create(data: CreateUserDTO & { password: string }): Promise<void> {
    await UserModel.create(data);
  }
}
