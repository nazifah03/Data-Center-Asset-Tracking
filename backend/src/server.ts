import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Start server
    app.listen(env.port, () => {
      logger.info(`🚀 Server running on http://localhost:${env.port}`);
      logger.info(`📝 Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
