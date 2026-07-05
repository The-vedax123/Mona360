import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Sparkles, Brain, User, AlertTriangle, ShieldAlert, ShieldCheck, Zap, WifiOff } from 'lucide-react';
import Page from '../components/ui/Page.jsx';
import AIInsightCard from '../components/AIInsightCard.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { api } from '../services/api.js';
import { computeMetrics, generateInsights, localAdvisorResponse, SUGGESTED_PROMPTS } from '../utils/aiLogic.js';

const RISK_META = {
  High: { tone: 'red', icon: ShieldAlert },
  Medium: { tone: 'amber', icon: AlertTriangle },
  Low: { tone: 'emerald', icon: ShieldCheck },
};

const MODE_META = {
  gemini: { label: 'Powered by Gemini', tone: 'brand', icon: Zap },
  fallback: { label: 'Data-driven', tone: 'accent', icon: Sparkles },
  offline: { label: 'Offline mode', tone: 'slate', icon: WifiOff },
};

export default function AIAdvisor() {
  const state = useBusiness();
  const { business, isEmpty } = state;
  const metrics = useMemo(() => computeMetrics(state), [state]);
  const insights = useMemo(() => generateInsights(state), [state]);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: isEmpty
        ? `Hi ${business?.owner_name?.split(' ')[0] || 'there'} 👋 I'm Mona AI. I don't have enough business data yet — add your sales, expenses and inventory (or load a demo business from the dashboard) and I'll give you tailored insights.`
        : `Hi ${business?.owner_name?.split(' ')[0] || 'there'} 👋 I'm Mona AI, your business advisor. I continuously monitor ${business?.business_name || 'your business'} — its sales, expenses, profit, inventory, invoices and wallet activity. Ask me anything, or tap a suggestion below.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const ask = async (text) => {
    const question = (text ?? input).trim();
    if (!question || typing) return;
    setMessages((m) => [...m, { role: 'user', content: question }]);
    setInput('');
    setTyping(true);
    try {
      let result;
      try {
        result = await api.aiAdvisor(business?.id, question, metrics);
      } catch {
        // Backend unreachable (e.g. static-only deploy) → on-device advisor.
        result = localAdvisorResponse(metrics, question);
      }
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: result.reply, riskLevel: result.riskLevel, mode: result.mode },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          isError: true,
          content: 'Sorry — I could not analyse your business just now. Please try again in a moment.',
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <Page title="Mona AI" subtitle="Your trusted AI business advisor — you stay in complete control.">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chat */}
        <div className="card flex h-[72vh] flex-col lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-white/5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Mona AI</p>
              <p className="flex items-center gap-1 text-xs text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Monitoring live business data
              </p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <ChatBubble key={i} message={m} />
            ))}
            {typing && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/15 text-brand-500">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="flex items-center gap-1">
                  <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
                  <span className="ml-1 text-xs">Mona AI is analysing…</span>
                </span>
              </div>
            )}
          </div>

          {/* Suggested prompts + input */}
          <div className="border-t border-slate-100 p-3 dark:border-white/5">
            <div className="mb-2 flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => ask(p)}
                  disabled={typing}
                  className="chip bg-slate-100 text-slate-600 transition hover:bg-brand-500/15 hover:text-brand-600 disabled:opacity-50 dark:bg-white/5 dark:text-slate-300"
                >
                  {p}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Mona AI about your business…"
                className="input"
              />
              <button type="submit" disabled={!input.trim() || typing} className="btn-primary shrink-0 px-3.5">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Insight cards */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Mona AI Insights
            </h3>
          </div>
          {insights.slice(0, 5).map((ins) => (
            <AIInsightCard key={ins.id} insight={ins} />
          ))}
        </div>
      </div>
    </Page>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  if (isUser) {
    return (
      <div className="flex justify-end gap-2">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-2.5 text-sm text-white">
          {message.content}
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  const risk = message.riskLevel ? RISK_META[message.riskLevel] : null;
  const mode = message.mode ? MODE_META[message.mode] : null;

  return (
    <div className="flex gap-2">
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${message.isError ? 'bg-red-500/15 text-red-500' : 'bg-brand-500/15 text-brand-500'}`}>
        <Sparkles className="h-4 w-4" />
      </div>
      <div className={`max-w-[88%] rounded-2xl rounded-tl-sm px-4 py-3 ${message.isError ? 'bg-red-500/10' : 'bg-slate-100 dark:bg-white/5'}`}>
        <FormattedReply text={message.content} />
        {(risk || mode) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-200/60 pt-2.5 dark:border-white/10">
            {risk && (
              <Badge tone={risk.tone} icon={risk.icon}>
                Risk: {message.riskLevel}
              </Badge>
            )}
            {mode && (
              <Badge tone={mode.tone} icon={mode.icon}>
                {mode.label}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Lightweight renderer for Mona AI replies (plain text with labels/lists). */
function FormattedReply({ text = '' }) {
  const lines = text.split('\n');
  const blocks = [];
  let list = null;

  const flush = () => {
    if (list) {
      blocks.push(
        <ul key={`l${blocks.length}`} className="my-1 space-y-1">
          {list.items.map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
              <span>{renderInline(it)}</span>
            </li>
          ))}
        </ul>
      );
      list = null;
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) {
      flush();
      return;
    }
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      if (!list) list = { items: [] };
      list.items.push((bullet ? bullet[1] : numbered[1]));
      return;
    }
    flush();
    // Section labels like "Key findings:", "Risk level: High"
    const label = line.match(/^([A-Za-z][A-Za-z\s]+):\s*(.*)$/);
    if (label && ['key findings', 'recommended actions', 'summary', 'risk level'].includes(label[1].toLowerCase())) {
      blocks.push(
        <p key={`h${idx}`} className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label[1]}
          {label[2] ? <span className="ml-1 text-slate-700 dark:text-slate-200">{label[2]}</span> : null}
        </p>
      );
      return;
    }
    blocks.push(
      <p key={`p${idx}`} className="text-sm text-slate-700 dark:text-slate-200">
        {renderInline(line)}
      </p>
    );
  });
  flush();
  return <div className="space-y-0.5">{blocks}</div>;
}

/** Renders **bold** segments inside a line. */
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

function Dot({ delay = '0ms' }) {
  return <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: delay }} />;
}
