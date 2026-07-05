import { Router } from 'express';
import { config } from '../config/index.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'businessbrain-ai-api',
    aiMode: config.openAiApiKey ? 'live' : 'mock',
    time: new Date().toISOString(),
  });
});

export default router;
