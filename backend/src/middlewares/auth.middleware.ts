import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { errorResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Token tidak ditemukan', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token!);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Token tidak valid atau expired', 401);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Akses ditolak: role tidak sesuai', 403);
    }

    next();
  };
};
