import { CreateUserDTO } from '../dto/create-user.dto';

export interface UserRecord {
  _id: string;
  email: string;
  password: string;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<UserRecord | null>;
  create(data: CreateUserDTO & { password: string }): Promise<void>;
}
