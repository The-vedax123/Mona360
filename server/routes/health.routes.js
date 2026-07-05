import { Router } from 'express';
import { isGeminiConfigured, isSupabaseConfigured } from '../config/index.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mona360-api',
    aiProvider: isGeminiConfigured ? 'gemini' : 'fallback',
    supabase: isSupabaseConfigured ? 'connected' : 'not-configured',
    time: new Date().toISOString(),
  });
});

export default router;
