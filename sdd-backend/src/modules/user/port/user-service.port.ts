import { CreateUserDTO } from '../dto/create-user.dto';

export interface UserServicePort {
  createUser(data: CreateUserDTO): Promise<{ token: string }>;
  updateUser(userId: string, data: { name?: string; password?: string }): Promise<void>;
}
