import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const validated = registerSchema.parse(req.body);
      const user = await AuthService.register(validated);
      return successResponse(res, user, 'Registrasi berhasil', 201);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return errorResponse(res, 'Validasi gagal', 400, error.errors);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated);
      return successResponse(res, result, 'Login berhasil');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return errorResponse(res, 'Validasi gagal', 400, error.errors);
      }
      return errorResponse(res, error.message, 401);
    }
  }

  static async me(req: AuthRequest, res: Response) {
    try {
      const user = await AuthService.getProfile(req.user!.userId);
      return successResponse(res, user, 'Profile berhasil diambil');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }
}
