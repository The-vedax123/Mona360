# Mona360

**See Everything. Decide Better.**
_Monitor. Understand. Grow._

Mona360 is an AI-powered business monitoring platform that gives entrepreneurs a
complete **360-degree view** of their business. It combines AI-driven insights,
financial monitoring, inventory intelligence, customer analytics, reporting, and
a blockchain-powered trust layer to help business owners make informed decisions
with confidence.

- **Mona** — seeing, observing and understanding.
- **360** — a complete, real-time view of a business.

Mona360 is **not just an AI chatbot**. It is an AI-powered business monitoring
platform where **Mona AI** monitors every aspect of your business, surfaces
intelligent insights, and recommends actions — while you remain in **complete
control**.

> This is a production-quality startup MVP. It runs **instantly** with a
> pre-loaded demo business (no setup required), and can be upgraded to real
> Supabase auth + persistence by adding environment variables.

---

## ✨ Features

- **Premium landing page** — hero (_See Everything. Decide Better._), problem/
  solution, Mona AI features, Web3 trust layer, Mona360 Wallet, dashboard
  preview, pricing and CTA.
- **Dashboard** — a time-aware welcome, **Mona360 Health Score**, revenue,
  expenses, profit, cash-flow status, inventory alerts, wallet summary, Mona AI
  recommendations and three charts (revenue vs expenses, expenses by category,
  profit trend).
- **Mona AI** — chat interface with suggested prompts and live insight cards.
  Uses the backend advisor when available, with a smart on-device fallback so
  demos never break. (Ask Mona AI · Mona AI Insights · Mona AI Reports · Mona AI
  Recommendations · Mona AI Forecasts.)
- **Sales / Expenses / Inventory** — full CRUD, filtering, best-seller & top
  cost detection, low/dead-stock and high-margin intelligence.
- **Invoices** — create, mark paid, auto-generated invoice number + blockchain
  invoice verification hash and status.
- **Mona360 Wallet** — your secure business wallet for payments, verified
  transactions and blockchain-backed financial records: balance, receive/send/
  QR, verified payment proofs, stablecoin & local-currency placeholders.
- **Mona360 Passport** — a portable digital business identity combining business
  info, AI performance insights, verification status, wallet identity,
  reputation and blockchain-backed trust in one professional profile.
- **Mona360 Insights** — intelligent business intelligence (not static reports):
  revenue/expense/profit/inventory views + a one-click **Mona AI Report** (what
  improved, what declined, risks, recommended next actions).
- **Settings** — business profile, owner details, currency, theme, notifications
  and wallet settings.
- **Mona360 Health Score & Mona360 Trust Score**, dark & light mode, toasts,
  empty/loading states, bottom nav on mobile, sidebar on desktop.

---

## 🧠 Scores

- **Mona360 Health Score** — a real-time AI assessment of your business
  performance based on sales, profitability, cash flow, expenses, inventory
  health and customer activity (90–100 Excellent · 70–89 Good · 50–69 Warning ·
  below 50 Critical).
- **Mona360 Trust Score** — reflects a verified business profile, payment
  history, invoice verification, business reputation, wallet verification and
  customer reliability.

---

## 🧱 Tech Stack

| Layer      | Tech                                                        |
| ---------- | ----------------------------------------------------------- |
| Frontend   | React 18 + Vite, React Router, Tailwind CSS, Recharts, lucide-react |
| Backend    | Node.js + Express (Mona AI advisor & report endpoints)      |
| Auth & DB  | Supabase (optional — local demo mode without it)            |
| Web3       | Optional wallet connect + demo verification hashes          |

---

## 📁 Project Structure

```
mona360/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # StatCard, HealthScoreCard, ChartCard, tables, cards, nav…
│   │   ├── pages/           # Landing, auth, Dashboard, Sales, Expenses, Inventory,
│   │   │                    # Invoices, Wallet, Passport, Insights (Reports), Settings, Mona AI (AIAdvisor)
│   │   ├── layouts/         # AppLayout (sidebar + bottom nav)
│   │   ├── hooks/           # useAuth, useBusiness, useTheme, useToast, useChartTheme
│   │   ├── services/        # supabaseClient, api
│   │   ├── utils/           # calculations, aiLogic, blockchain, format
│   │   ├── data/            # demoData (BrightMart Supplies)
│   │   └── styles/          # Tailwind entry
│   └── ...
├── server/                 # Express backend
│   ├── routes/  controllers/  services/  middleware/  config/  utils/
│   └── index.js
├── supabase/
│   └── schema.sql          # Full schema + RLS policies + auth trigger
└── package.json            # npm workspaces (client + server)
```

---

## 🚀 Getting Started

### 1. Install

```bash
npm install
```

This installs both the client and server (npm workspaces).

### 2. Run (frontend + backend together)

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000 (the frontend proxies `/api` to it)

Then open the app and either **sign up**, or click **“Try the demo business”**
to explore a fully pre-loaded business instantly.

You can also run them separately:

```bash
npm run dev:client
npm run dev:server
```

### 3. Build for production

```bash
npm run build      # builds the client to client/dist
npm run start      # starts the Express server
```

---

## ▲ Deploy to Vercel

The repo is **Vercel-ready with zero configuration** (see `vercel.json`):

- The **frontend** (Vite) builds to `client/dist` and is served as a static SPA.
- The **backend** runs as a Vercel **serverless function** at `/api/*`
  (`api/index.mjs` wraps the Express app), so Mona AI works in production too.
- If the API is ever unavailable, the frontend automatically falls back to an
  on-device advisor, so the app never breaks.

**Steps:**

1. Push this repo to GitHub (already done).
2. Go to [vercel.com/new](https://vercel.com/new) → **Import** the `Mona360`
   repository.
3. Leave the defaults (Vercel reads `vercel.json`) and click **Deploy**.
4. _(Optional)_ Add environment variables in Vercel → Project → Settings →
   Environment Variables:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — enable real Supabase auth.
   - `OPENAI_API_KEY` — upgrade Mona AI to a live LLM (optional).

That's it — no build settings to change. You can also deploy from the CLI with
`npx vercel` (requires a Vercel login/token).

---

## 🔐 Authentication & Data Modes

Mona360 works in **two modes**:

1. **Local demo mode (default).** No configuration needed. Accounts and business
   data are stored in the browser (localStorage). The **demo login** seeds the
   full *BrightMart Supplies* dataset so the app looks alive immediately.
2. **Supabase mode.** Add the following to `client/.env` to enable real email/
   password auth. See `client/.env.example`.

```bash
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Then run the SQL in [`supabase/schema.sql`](supabase/schema.sql) in the Supabase
SQL editor to create the tables, Row Level Security policies and the sign-up
trigger.

Wallet connection is always **optional** — the entire platform works without Web3.

---

## 🤖 Mona AI (Google Gemini)

Mona AI is a real AI-powered business advisor. It analyses the user's business
data (sales, expenses, profit, inventory, invoices, wallet activity and health
score) and responds **dynamically** to each question — no fixed, repeated
answers.

**Endpoint:** `POST /api/ai/advisor`

```jsonc
// Request
{ "businessId": "…", "message": "How is my business doing?", "context": { /* client metrics */ } }

// Response
{ "reply": "…", "riskLevel": "High", "mode": "gemini", "source": "supabase" }
```

**How it works (server-side):**

1. Resolves business data — from **Supabase** when configured (`SUPABASE_URL` +
   `SUPABASE_SERVICE_ROLE_KEY`), otherwise from the client-provided `context`.
2. Calculates total revenue, total expenses, net profit, profit margin,
   low-stock items, unpaid invoices, best-selling product, highest expense
   category and the Mona360 Health Score.
3. Sends a Mona AI system prompt + business summary + the user's question to
   **Google Gemini**.
4. Returns a smart, structured response (summary · key findings · recommended
   actions · risk level).

**Enable Gemini** — set in `server/.env` (never exposed to the frontend; all AI
requests go through the Node.js backend):

```bash
GEMINI_API_KEY=your_key_from_https://aistudio.google.com/apikey
GEMINI_MODEL=gemini-2.0-flash   # optional
```

**Fallback (no key / API down):** if `GEMINI_API_KEY` is missing or Gemini
fails, the backend returns a **dynamic rule-based advisor** built from the real
business data (expenses too high, low stock, unpaid invoices, profit positive,
etc.). If the backend itself is unreachable (e.g. a static-only deploy), the
frontend falls back to the same on-device logic — so Mona AI never breaks.

---

## ⛓ Blockchain / Trust Layer

Mona360 is **not a crypto platform**. Blockchain is used, in plain
business-friendly language, only to provide:

- **Portable business identity** (optional wallet linked to the profile)
- **Verified payment records** (every wallet transaction gets a proof)
- **Invoice verification** (each invoice carries a unique verification hash)
- **Digital business credentials** (the Mona360 Passport)
- **Business reputation** (a trust score influenced by verified records)
- **Secure wallet integration**

For the MVP these use demo/simulated hashes (see `client/src/utils/blockchain.js`
and `server/utils/hash.js`). The structure is designed so real on-chain
integration can be added later without changing the UX.

---

## 📊 Demo Business

The demo (and optional "prefill sample data" on onboarding) seeds:

- **BrightMart Supplies** — Newton Banda · Retail & General Trading · Lusaka,
  Zambia · ZMW
- Sales, expenses, inventory, invoices and wallet transactions that make every
  page feel alive.

---

## 📜 License

MIT — build something great with it.
