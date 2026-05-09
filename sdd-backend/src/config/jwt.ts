import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'kandaidu92dj90ju32';

export const signToken = (sub: string): string =>
  jwt.sign({ sub }, SECRET, { expiresIn: '6h' });
