import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Sparkles, Brain, User } from 'lucide-react';
import Page from '../components/ui/Page.jsx';
import AIInsightCard from '../components/AIInsightCard.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { api } from '../services/api.js';
import { computeMetrics, generateInsights, localAdvisorReply, SUGGESTED_PROMPTS } from '../utils/aiLogic.js';

export default function AIAdvisor() {
  const state = useBusiness();
  const { business } = state;
  const metrics = useMemo(() => computeMetrics(state), [state]);
  const insights = useMemo(() => generateInsights(state), [state]);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      title: `Hi ${business?.owner_name?.split(' ')[0] || 'there'} 👋`,
      content: `I'm Mona AI, your business advisor. I monitor ${business?.business_name || 'your business'} continuously. Ask me anything about your performance — or tap a suggestion below.`,
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
      let reply;
      try {
        reply = await api.aiChat(question, metrics);
      } catch {
        reply = localAdvisorReply(question, metrics);
      }
      setMessages((m) => [
        ...m,
        { role: 'assistant', title: reply.title, content: reply.message, bullets: reply.bullets, suggestions: reply.suggestions },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <Page title="Mona AI" subtitle="Your trusted AI business advisor — you stay in complete control.">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chat */}
        <div className="card flex h-[70vh] flex-col lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-white/5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Mona AI</p>
              <p className="flex items-center gap-1 text-xs text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Monitoring live data
              </p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <ChatBubble key={i} message={m} onSuggestion={ask} />
            ))}
            {typing && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/15 text-brand-500">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="flex gap-1">
                  <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
                </span>
              </div>
            )}
          </div>

          {/* Suggested prompts */}
          <div className="border-t border-slate-100 p-3 dark:border-white/5">
            <div className="mb-2 flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => ask(p)}
                  className="chip bg-slate-100 text-slate-600 transition hover:bg-brand-500/15 hover:text-brand-600 dark:bg-white/5 dark:text-slate-300"
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
                placeholder="Ask about your business…"
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

function ChatBubble({ message, onSuggestion }) {
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
  return (
    <div className="flex gap-2">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-brand-500">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 dark:bg-white/5">
        {message.title && <p className="mb-1 font-bold text-slate-900 dark:text-white">{message.title}</p>}
        <p className="text-sm text-slate-600 dark:text-slate-300">{message.content}</p>
        {message.bullets?.length > 0 && (
          <ul className="mt-2 space-y-1">
            {message.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                {b}
              </li>
            ))}
          </ul>
        )}
        {message.suggestions?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {message.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="chip bg-white text-brand-600 shadow-sm transition hover:bg-brand-50 dark:bg-white/10 dark:text-brand-300"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Dot({ delay = '0ms' }) {
  return <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: delay }} />;
}
