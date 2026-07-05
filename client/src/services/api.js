const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  aiAdvisor: (businessId, message, context) => post('/ai/advisor', { businessId, message, context }),
  aiChat: (message, metrics) => post('/ai/chat', { message, metrics }),
  aiReport: (metrics) => post('/ai/report', { metrics }),
  health: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },
};
