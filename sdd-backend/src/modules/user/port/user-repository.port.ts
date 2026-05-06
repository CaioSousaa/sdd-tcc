import { CreateUserDTO } from '../dto/create-user.dto';

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<{ email: string } | null>;
  create(data: CreateUserDTO & { password: string }): Promise<void>;
}
