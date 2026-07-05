import { generateAdvisorReply, generateBusinessReport } from '../services/ai.service.js';

export async function chat(req, res, next) {
  try {
    const { message, metrics } = req.body || {};
    if (!message || typeof message !== 'string') {
      const err = new Error('A "message" string is required.');
      err.status = 400;
      throw err;
    }
    const reply = await generateAdvisorReply(message, metrics || {});
    res.json(reply);
  } catch (err) {
    next(err);
  }
}

export async function report(req, res, next) {
  try {
    const { metrics } = req.body || {};
    const result = await generateBusinessReport(metrics || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}
