import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, {
    message: 'Username hanya boleh huruf, angka, dan underscore',
  }),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  fullName: z.string().min(3).max(100),
  role: z.enum(['ADMIN', 'TECHNICIAN']).optional(),
});

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
