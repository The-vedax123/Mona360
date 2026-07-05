import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Boxes,
  FileText,
  BadgeCheck,
  BarChart3,
  Brain,
  Check,
  Moon,
  Sun,
  LineChart,
  Fingerprint,
  ReceiptText,
} from 'lucide-react';
import Logo from '../components/ui/Logo.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import DashboardPreview from '../components/marketing/DashboardPreview.jsx';

function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>
      {children}
    </section>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-300">
      {children}
    </span>
  );
}

export default function Landing() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-200">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-slate-50/80 backdrop-blur-xl dark:border-white/10 dark:bg-navy-950/70">
        <Section className="flex items-center justify-between py-3.5">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400 md:flex">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white">Features</a>
            <a href="#trust" className="hover:text-slate-900 dark:hover:text-white">Trust Layer</a>
            <a href="#wallet" className="hover:text-slate-900 dark:hover:text-white">Wallet</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">Sign in</Link>
            <Link to="/signup" className="btn-primary">Get Started</Link>
          </div>
        </Section>
      </header>

      {/* Hero */}
      <Section className="relative pb-10 pt-14 sm:pt-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-light [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] [background-size:32px_32px] dark:bg-grid-dark" />
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[100px]" />
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex justify-center">
            <Pill>
              <Sparkles className="h-3.5 w-3.5" /> AI advisor · Web3 trust · one dashboard
            </Pill>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            BusinessBrain <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Monitor your business, understand your numbers, and make smarter decisions with AI-powered
            insights and blockchain-backed trust.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup" className="btn-primary w-full px-6 py-3 text-base sm:w-auto">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-secondary w-full px-6 py-3 text-base sm:w-auto">
              View Demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            No credit card. No wallet required. Works instantly with a pre-loaded demo business.
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-r from-brand-500/20 to-accent-500/20 blur-2xl" />
          <DashboardPreview />
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['360°', 'Monitoring'],
            ['AI', 'Recommendations'],
            ['Verified', 'Records'],
            ['Mobile', 'First'],
          ].map(([a, b]) => (
            <div key={b} className="text-center">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{a}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Problem */}
      <Section className="py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Pill>The problem</Pill>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Most small businesses fly blind.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Sales in one notebook, expenses in another, stock in your head, and invoices lost in chat.
              By the time you notice a problem, it has already cost you money.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'No clear picture of profit vs. cash flow',
                'Stock runs out — or sits dead on the shelf',
                'Unpaid invoices slip through the cracks',
                'No trusted way to prove your track record',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-500/15 text-red-500">✕</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: TrendingUp, label: 'Scattered sales', tone: 'text-brand-500' },
              { icon: ReceiptText, label: 'Untracked costs', tone: 'text-amber-500' },
              { icon: Boxes, label: 'Stock guesswork', tone: 'text-accent-500' },
              { icon: FileText, label: 'Lost invoices', tone: 'text-red-500' },
            ].map((c) => (
              <div key={c.label} className="card p-6">
                <c.icon className={`h-8 w-8 ${c.tone}`} />
                <p className="mt-3 font-semibold text-slate-900 dark:text-white">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Solution */}
      <Section className="py-16">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-brand-50 p-8 dark:border-white/10 dark:from-white/[0.04] dark:to-brand-900/20 sm:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <Pill>The solution</Pill>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              One brain for your whole business.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              BusinessBrain AI brings sales, expenses, inventory, invoices, cash flow and wallet activity
              together — then an AI advisor watches everything and tells you exactly what to do next.
              You stay in full control.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Brain, title: 'AI monitors 24/7', text: 'Continuously scans your data for risks, trends and opportunities.' },
              { icon: LineChart, title: 'You see clearly', text: 'A single dashboard with health score, profit and cash flow.' },
              { icon: Check, title: 'You decide', text: 'AI recommends. You approve. The owner is always in control.' },
            ].map((c) => (
              <div key={c.title} className="card p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-500">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* AI features */}
      <Section id="features" className="py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Pill><Sparkles className="h-3.5 w-3.5" /> AI features</Pill>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Your AI business advisor
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Not a chatbot bolted on — a monitoring engine that understands your real numbers.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: TrendingUp, title: 'Business Health Score', text: 'A live 0–100 score blending profit, margin, inventory and cash flow.' },
            { icon: Brain, title: 'Smart recommendations', text: 'Plain-language actions generated from your actual data — no jargon.' },
            { icon: Boxes, title: 'Inventory intelligence', text: 'Flags low stock, dead stock, high-margin winners and restock needs.' },
            { icon: BarChart3, title: 'Trend prediction', text: 'Revenue, expense and profit trends visualised over time.' },
            { icon: ReceiptText, title: 'Expense insight', text: 'Pinpoints your biggest cost centres and where to trim safely.' },
            { icon: FileText, title: 'AI reports', text: 'One click generates a summary of what improved, declined and what to do next.' },
          ].map((c) => (
            <div key={c.title} className="card group p-6 transition hover:-translate-y-1 hover:shadow-glow">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{c.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Web3 trust layer */}
      <Section id="trust" className="py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1 grid gap-4 sm:grid-cols-2">
            {[
              { icon: Fingerprint, title: 'Portable business identity', text: 'Your business, verifiable anywhere.' },
              { icon: ShieldCheck, title: 'Verified payment proof', text: 'Every payment leaves a tamper-evident record.' },
              { icon: FileText, title: 'Invoice verification', text: 'Each invoice carries a unique verification hash.' },
              { icon: BadgeCheck, title: 'Reputation & trust score', text: 'Build credibility with partners and lenders.' },
            ].map((c) => (
              <div key={c.title} className="card p-5">
                <c.icon className="h-7 w-7 text-accent-500" />
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.text}</p>
              </div>
            ))}
          </div>
          <div className="order-1 lg:order-2">
            <Pill><ShieldCheck className="h-3.5 w-3.5" /> Web3 trust layer</Pill>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Trust, built in — without the crypto complexity.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Blockchain works quietly in the background to make your records verifiable and your business
              reputation portable. No confusing Web3 language — just trust you can prove.
            </p>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Wallet features are always optional. Normal users can run the entire platform without ever
              touching Web3.
            </p>
          </div>
        </div>
      </Section>

      {/* Wallet */}
      <Section id="wallet" className="py-16">
        <div className="grid items-center gap-10 rounded-3xl border border-slate-200 bg-white p-8 dark:border-white/10 dark:bg-white/[0.03] sm:p-12 lg:grid-cols-2">
          <div>
            <Pill><Wallet className="h-3.5 w-3.5" /> Business wallet</Pill>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              A finance wallet — not a crypto maze.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              Track your business balance, receive and send payments, generate QR codes and keep verified
              payment proofs. Stablecoin and local-currency views are built for how you actually run money.
            </p>
            <ul className="mt-6 space-y-3">
              {['Business balance & local currency view', 'Receive, send & QR payments', 'Verified payment proof records', 'Optional wallet connect'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
                    <Check className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-brand-500/30 to-accent-500/30 blur-2xl" />
            <div className="rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-6 text-white shadow-glow">
              <div className="flex items-center justify-between text-sm text-white/80">
                <span className="inline-flex items-center gap-2"><Wallet className="h-4 w-4" /> BusinessBrain Wallet</span>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs">Connected</span>
              </div>
              <p className="mt-6 text-sm text-white/70">Business balance</p>
              <p className="text-3xl font-extrabold">K 17,850.00</p>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-white/10 p-3"><p className="font-bold">Receive</p></div>
                <div className="rounded-xl bg-white/10 p-3"><p className="font-bold">Send</p></div>
                <div className="rounded-xl bg-white/10 p-3"><p className="font-bold">QR</p></div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing" className="py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Pill>Pricing</Pill>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Start free. Grow when you do.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { name: 'Starter', price: 'Free', tag: 'For getting started', features: ['Dashboard & health score', 'Sales, expenses & inventory', 'Basic AI insights', 'Demo wallet & passport'], cta: 'Get Started', highlight: false },
            { name: 'Growth', price: 'K199', per: '/mo', tag: 'For growing businesses', features: ['Everything in Starter', 'Unlimited invoices', 'Advanced AI advisor', 'Verified payment proofs', 'AI reports'], cta: 'Start Growth', highlight: true },
            { name: 'Business', price: 'K499', per: '/mo', tag: 'For established teams', features: ['Everything in Growth', 'Full Web3 trust layer', 'Priority support', 'Team access (soon)'], cta: 'Contact Sales', highlight: false },
          ].map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-3xl border p-7 ${
                p.highlight
                  ? 'border-brand-500 bg-gradient-to-b from-brand-500/10 to-transparent shadow-glow'
                  : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]'
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white">
                  Most popular
                </span>
              )}
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{p.name}</p>
              <p className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-white">
                {p.price}
                {p.per && <span className="text-base font-medium text-slate-400">{p.per}</span>}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.tag}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className={`mt-7 ${p.highlight ? 'btn-primary' : 'btn-secondary'} w-full`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-10 text-center text-white sm:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-black sm:text-4xl">Give your business a brain.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">
              Join BusinessBrain AI and turn scattered numbers into smart decisions — with trust built in.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/signup" className="btn w-full bg-white px-6 py-3 text-base font-bold text-brand-700 hover:bg-white/90 sm:w-auto">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn w-full border border-white/40 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 sm:w-auto">
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 dark:border-white/10">
        <Section className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo size="sm" />
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} BusinessBrain AI · Monitor your business. Decide smarter.
          </p>
          <div className="flex gap-5 text-sm text-slate-500 dark:text-slate-400">
            <a href="#features" className="hover:text-brand-500">Features</a>
            <a href="#pricing" className="hover:text-brand-500">Pricing</a>
            <Link to="/login" className="hover:text-brand-500">Sign in</Link>
          </div>
        </Section>
      </footer>
    </div>
  );
}
