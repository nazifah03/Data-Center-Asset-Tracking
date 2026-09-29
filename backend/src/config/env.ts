import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // JWT
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
} as const;

// Validasi env yang wajib
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`❌ Environment variable ${key} is required`);
  }
}
