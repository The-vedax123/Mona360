// Vercel serverless entry point for the Mona360 API.
// The Express app is a valid (req, res) handler, so we can export it directly.
// All /api/* requests are routed here via vercel.json rewrites.
import app from '../server/app.js';

export default app;
