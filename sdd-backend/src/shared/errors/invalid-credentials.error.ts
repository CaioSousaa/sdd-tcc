export class InvalidCredentialsError extends Error {
  constructor() {
    super('E-mail ou senha incorretos, tente novamente');
    this.name = 'InvalidCredentialsError';
  }
}
