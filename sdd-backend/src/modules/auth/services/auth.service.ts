import bcrypt from 'bcrypt';
import { UserRepositoryPort } from '../../user/port/user-repository.port';
import { AuthServicePort } from '../port/auth-service.port';
import { LoginDTO } from '../dto/login.dto';
import { InvalidCredentialsError } from '../../../shared/errors/invalid-credentials.error';
import { signToken } from '../../../config/jwt';
import { addToBlacklist } from '../../../infra/token-blacklist';

export class AuthService implements AuthServicePort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async login({ email, password }: LoginDTO): Promise<{ token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new InvalidCredentialsError();

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new InvalidCredentialsError();

    const token = signToken(user._id.toString());
    return { token };
  }

  async logout(token: string): Promise<void> {
    addToBlacklist(token);
  }
}
