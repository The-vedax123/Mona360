# BusinessBrain AI

**Monitor Your Business. Make Smarter Decisions with AI.**

BusinessBrain AI is an AI-powered business monitoring and intelligence platform
for small and growing businesses. It brings **sales, expenses, inventory,
invoices, cash flow, wallet activity and business performance** together into one
beautiful, mobile-first dashboard — with an AI advisor that monitors your
business, flags risks, predicts trends and recommends actions while **you stay in
full control**.

A balanced **Web3 trust layer** adds verifiable records, payment proof, wallet
identity and a **digital Business Passport** — without any confusing crypto
jargon.

> This is a production-quality hackathon MVP. It runs **instantly** with a
> pre-loaded demo business (no setup required), and can be upgraded to real
> Supabase auth + persistence by adding environment variables.

---

## ✨ Features

- **Premium landing page** — hero, problem/solution, AI features, Web3 trust
  layer, business wallet, dashboard preview, pricing and CTA.
- **Dashboard** — Business Health Score, revenue/expenses/profit, cash-flow
  status, inventory risk, recent activity, AI recommendations and 3 charts
  (revenue vs expenses, expenses by category, profit trend).
- **AI Advisor** — chat interface with suggested prompts and live insight cards.
  Uses the backend advisor when available, with a smart on-device fallback.
- **Sales / Expenses / Inventory** — full CRUD, filtering, best-seller & top
  cost detection, low/dead-stock and high-margin intelligence.
- **Invoices** — create, mark paid, auto-generated invoice number + blockchain
  verification hash and status.
- **Wallet** — business finance wallet with balance, receive/send/QR, verified
  payment proofs, stablecoin & local-currency placeholders.
- **Business Passport** — verifiable digital identity with health & trust
  scores, reputation badge, QR and share.
- **Reports** — revenue/expense/profit/inventory reports + one-click AI report
  (what improved, what declined, risks, next actions).
- **Settings** — business profile, owner details, currency, theme, notifications
  and wallet settings.
- **Dark & light mode, toasts, empty/loading states, bottom nav on mobile,
  sidebar on desktop.**

---

## 🧱 Tech Stack

| Layer      | Tech                                                        |
| ---------- | ----------------------------------------------------------- |
| Frontend   | React 18 + Vite, React Router, Tailwind CSS, Recharts, lucide-react |
| Backend    | Node.js + Express (AI advisor & report endpoints)           |
| Auth & DB  | Supabase (optional — local demo mode without it)            |
| Web3       | Optional wallet connect + demo verification hashes          |

---

## 📁 Project Structure

```
businessbrain-ai/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # StatCard, HealthScoreCard, ChartCard, tables, cards, nav…
│   │   ├── pages/           # Landing, auth, Dashboard, Sales, Expenses, Inventory,
│   │   │                    # Invoices, Wallet, BusinessPassport, Reports, Settings, AIAdvisor
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

## 🔐 Authentication & Data Modes

BusinessBrain AI works in **two modes**:

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

## 🤖 AI Advisor

The Express backend (`server/services/ai.service.js`) contains a deterministic,
**data-driven** advisor that turns your real metrics into plain-language
recommendations and reports — perfect for reliable demos.

To upgrade to a real LLM later, set `OPENAI_API_KEY` in `server/.env` and extend
`ai.service.js` (the endpoints and client wiring are already in place). When the
backend is unreachable, the client falls back to an on-device advisor so the demo
never breaks.

---

## ⛓ Blockchain / Web3 Trust Layer

Blockchain is used **only where it adds trust**, with business-friendly wording:

- **Portable business identity** (optional wallet linked to the profile)
- **Verified payment proof** (every wallet transaction gets a proof hash)
- **Invoice verification** (each invoice carries a unique verification hash)
- **Reputation & Business Passport** (a trust score influenced by verified records)

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
