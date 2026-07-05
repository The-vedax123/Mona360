import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/index.js';
import aiRoutes from './routes/ai.routes.js';
import healthRoutes from './routes/health.routes.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

/**
 * Builds the configured Express app WITHOUT starting a listener.
 * This lets the same app run as a long-lived server (local/dev via index.js)
 * and as a Vercel serverless function (api/index.mjs).
 */
export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '1mb' }));
  if (config.env !== 'test' && !process.env.VERCEL) {
    app.use(morgan('dev'));
  }

  app.use('/api', healthRoutes);
  app.use('/api/ai', aiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

const app = createApp();
export default app;
