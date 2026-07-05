import app from './app.js';
import { config, isGeminiConfigured, isSupabaseConfigured } from './config/index.js';

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `\n  Mona360 API running on http://localhost:${config.port}` +
      `\n  Mona AI: ${isGeminiConfigured ? `Gemini (${config.geminiModel})` : 'data-driven fallback (no GEMINI_API_KEY)'}` +
      `\n  Supabase: ${isSupabaseConfigured ? 'connected' : 'not configured (using client context)'}\n`
  );
});
