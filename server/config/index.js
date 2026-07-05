import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : '*',
  env: process.env.NODE_ENV || 'development',

  // Google Gemini (primary AI provider for Mona AI)
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',

  // Optional legacy OpenAI key (not required)
  openAiApiKey: process.env.OPENAI_API_KEY || '',

  // Supabase (server-side data fetch). Prefer the service-role key so the
  // backend can read business data securely; falls back to anon key.
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
};

export const isGeminiConfigured = Boolean(config.geminiApiKey);
export const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseKey);
