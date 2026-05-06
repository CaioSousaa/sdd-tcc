import { CreateUserDTO } from '../dto/create-user.dto';

export interface UserServicePort {
  createUser(data: CreateUserDTO): Promise<{ token: string }>;
}
