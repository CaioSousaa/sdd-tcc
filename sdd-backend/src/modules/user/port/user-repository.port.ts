import { CreateUserDTO } from '../dto/create-user.dto';

export interface UserRecord {
  _id: string;
  email: string;
  password: string;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(data: CreateUserDTO & { password: string }): Promise<UserRecord>;
  update(id: string, data: { name?: string; password?: string }): Promise<void>;
}
