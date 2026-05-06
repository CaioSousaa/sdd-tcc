import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../authenticate';

jest.mock('jsonwebtoken', () => {
  const actual = jest.requireActual<typeof import('jsonwebtoken')>('jsonwebtoken');
  return { ...actual, verify: jest.fn() };
});

function mockReq(authHeader?: string): Request {
  return { headers: { authorization: authHeader } } as Request;
}

function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

describe('authenticate — token ausente ou malformado', () => {
  it('returns 401 when Authorization header is missing', () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token não informado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header has no Bearer prefix', () => {
    const req = mockReq('Basic sometoken');
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token não informado' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('authenticate — token expirado', () => {
  it('returns 401 with expiration message when token is expired', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.TokenExpiredError('jwt expired', new Date());
    });

    const req = mockReq('Bearer expired.token.here');
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token expirado, faça login novamente',
    });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('authenticate — token inválido', () => {
  it('returns 401 when token signature is invalid', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.JsonWebTokenError('invalid signature');
    });

    const req = mockReq('Bearer invalid.token.here');
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('authenticate — token válido', () => {
  it('injects userId into req and calls next()', () => {
    (jwt.verify as jest.Mock).mockReturnValue({ sub: 'user-id-123' });

    const req = mockReq('Bearer valid.token.here');
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(req.userId).toBe('user-id-123');
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('does not expose response when token is valid', () => {
    (jwt.verify as jest.Mock).mockReturnValue({ sub: 'user-id-456' });

    const req = mockReq('Bearer valid.token.here');
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.json).not.toHaveBeenCalled();
  });
});
