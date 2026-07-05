import { generateAdvisorReply, generateBusinessReport } from '../services/ai.service.js';
import { getAdvisorResponse } from '../services/advisor.service.js';

/**
 * POST /api/ai/advisor
 * Body: { businessId, message, context }
 * Returns a smart, dynamic Mona AI response (Gemini when configured, else a
 * data-driven rule-based fallback).
 */
export async function advisor(req, res, next) {
  try {
    const { businessId, message, context } = req.body || {};
    if (!message || typeof message !== 'string') {
      const err = new Error('A "message" string is required.');
      err.status = 400;
      throw err;
    }
    const result = await getAdvisorResponse({ businessId, message, context });
    res.json({ ...result, generatedAt: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

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
