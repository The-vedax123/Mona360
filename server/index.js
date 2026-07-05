import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/index.js';
import aiRoutes from './routes/ai.routes.js';
import healthRoutes from './routes/health.routes.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api', healthRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `\n  Mona360 API running on http://localhost:${config.port}\n  Mona AI mode: ${
      config.openAiApiKey ? 'live LLM (key detected)' : 'smart mock (data-driven)'
    }\n`
  );
});

export default app;
