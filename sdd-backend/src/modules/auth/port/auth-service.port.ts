import { LoginDTO } from '../dto/login.dto';

export interface AuthServicePort {
  login(dto: LoginDTO): Promise<{ token: string }>;
}
