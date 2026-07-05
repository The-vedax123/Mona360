import { BadgeCheck, ShieldCheck, QrCode, MapPin } from 'lucide-react';
import { truncateMiddle } from '../utils/format.js';
import { trustBadge } from '../utils/blockchain.js';

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur">
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-white/60">{label}</p>
    </div>
  );
}

export default function BusinessPassportCard({ business, healthScore, trustScore, stats }) {
  const badge = trustBadge(trustScore);
  const verified = business?.verification_status === 'verified';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900 p-6 text-white shadow-card">
      <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/60">
            <BadgeCheck className="h-4 w-4 text-accent-400" /> Digital Business Passport
          </div>
          <QrCode className="h-9 w-9 text-white/80" />
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-2xl font-black">
            {business?.business_name?.charAt(0) || 'B'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold">{business?.business_name}</h2>
            <p className="text-sm text-white/70">{business?.owner_name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
              <MapPin className="h-3 w-3" /> {business?.city}, {business?.country} · {business?.business_type}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" /> {verified ? 'Verified business' : 'Verification pending'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
            {badge.label}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Health" value={`${healthScore}`} />
          <Stat label="Trust" value={`${trustScore}`} />
          <Stat label="Invoices" value={stats?.invoicesIssued ?? 0} />
          <Stat label="Paid" value={stats?.paidInvoices ?? 0} />
        </div>

        <div className="mt-5 rounded-xl bg-white/5 p-3">
          <p className="text-[11px] uppercase tracking-wide text-white/50">Portable business identity</p>
          <p className="font-mono text-sm">
            {business?.wallet_address ? truncateMiddle(business.wallet_address, 10, 8) : 'No wallet linked'}
          </p>
        </div>
      </div>
    </div>
  );
}
