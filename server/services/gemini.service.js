import { config, isGeminiConfigured } from '../config/index.js';

export { isGeminiConfigured };

export const MONA_SYSTEM_PROMPT = `You are Mona AI, the intelligent business advisor inside Mona360.

Mona360 helps entrepreneurs monitor their business, understand performance, and make smarter decisions.

You are not here to fully run the user's business. You monitor, analyze, explain, and recommend. The business owner remains in full control.

Always give practical, business-focused advice.
Use simple language.
When possible, mention exact numbers from the user's business data.

Focus on:
- sales performance
- expenses
- profit
- cash flow
- inventory risks
- unpaid invoices
- business growth
- customer behavior
- wallet and payment activity
- blockchain-backed trust records

Do not give the same response every time. Adapt your answer to the user's actual question and business data.
If data is missing, say what data is missing and suggest what the user should add.
Keep responses clear and useful.

Format responses with:
- A short summary
- Key findings
- Recommended actions
- Risk level where appropriate

Keep the whole answer concise (under ~220 words). Do not use markdown headings (#); use plain labels like "Key findings:" and "Recommended actions:".`;

/**
 * Call Google Gemini with the Mona AI system prompt + business context.
 * Returns the generated text. Throws on failure so callers can fall back.
 */
export async function askGemini({ businessSummary, message }) {
  if (!isGeminiConfigured) {
    const err = new Error('Gemini API key not configured');
    err.code = 'NO_KEY';
    throw err;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`;

  const userContent = `Here is the current business data:\n\n${businessSummary}\n\nUser question:\n${message}`;

  const payload = {
    system_instruction: { parts: [{ text: MONA_SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: userContent }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 700,
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.error(`[MonaAI] Gemini API HTTP ${res.status} for model "${config.geminiModel}": ${detail.slice(0, 300)}`);
    const err = new Error(`Gemini request failed (${res.status})`);
    err.code = res.status === 401 || res.status === 403 ? 'AUTH' : 'GEMINI_ERROR';
    throw err;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  if (!text.trim()) {
    const err = new Error('Gemini returned an empty response');
    err.code = 'EMPTY';
    throw err;
  }
  return text.trim();
}
