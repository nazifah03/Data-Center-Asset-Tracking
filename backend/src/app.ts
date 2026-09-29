import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorResponse } from './utils/response';
import authRoutes from './modules/auth/auth.routes';
import assetRoutes from './modules/asset/asset.routes';
import maintenanceRoutes from './modules/maintenance/maintenance.routes';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.nodeEnv,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  errorResponse(res, 'Route not found', 404);
});

export default app;