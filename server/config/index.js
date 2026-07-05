import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : '*',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  env: process.env.NODE_ENV || 'development',
};
