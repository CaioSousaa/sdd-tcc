import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isBlacklisted } from '../../infra/token-blacklist';

const SECRET = process.env.JWT_SECRET ?? 'kandaidu92dj90ju32';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não informado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, SECRET) as jwt.JwtPayload;
    if (isBlacklisted(token)) {
      res.status(401).json({ message: 'Token inválido' });
      return;
    }
    req.userId = payload.sub;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expirado, faça login novamente' });
      return;
    }
    res.status(401).json({ message: 'Token inválido' });
  }
}
