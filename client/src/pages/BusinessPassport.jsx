import { useMemo } from 'react';
import { Share2, ShieldCheck, FileText, CheckCircle2, Repeat, Award, Info } from 'lucide-react';
import Page from '../components/ui/Page.jsx';
import BusinessPassportCard from '../components/BusinessPassportCard.jsx';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { businessHealthScore, businessTrustScore } from '../utils/calculations.js';
import { trustBadge } from '../utils/blockchain.js';

export default function BusinessPassport() {
  const { business, sales, expenses, inventory, invoices, walletTransactions } = useBusiness();
  const toast = useToast();

  const healthScore = useMemo(
    () => businessHealthScore({ sales, expenses, inventory }),
    [sales, expenses, inventory]
  );
  const trustScore = useMemo(
    () => businessTrustScore({ business, invoices, walletTransactions, healthScore }),
    [business, invoices, walletTransactions, healthScore]
  );

  const paidInvoices = invoices.filter((i) => i.status === 'paid').length;
  const completedTx = walletTransactions.filter((t) => t.status === 'confirmed').length;
  const badge = trustBadge(trustScore);

  const share = async () => {
    const url = window.location.href;
    const text = `${business?.business_name} · Verified on BusinessBrain AI · Trust score ${trustScore}/100`;
    try {
      if (navigator.share) {
        await navigator.share({ title: business?.business_name, text, url });
      } else {
        await navigator.clipboard.writeText(`${text} — ${url}`);
        toast.success('Passport link copied to clipboard');
      }
    } catch {
      toast.info('Sharing cancelled');
    }
  };

  return (
    <Page
      title="Business Passport"
      subtitle="Your verifiable, portable business identity."
      action={
        <button onClick={share} className="btn-primary">
          <Share2 className="h-4 w-4" /> Share Passport
        </button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BusinessPassportCard
            business={business}
            healthScore={healthScore}
            trustScore={trustScore}
            stats={{ invoicesIssued: invoices.length, paidInvoices }}
          />
        </div>

        <div className="card flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <Award className="h-4 w-4 text-amber-500" /> Reputation Badge
            </div>
            <div className="mt-4 flex flex-col items-center text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-glow">
                <ShieldCheck className="h-9 w-9" />
              </div>
              <p className="mt-3 text-lg font-extrabold text-slate-900 dark:text-white">{badge.label}</p>
              <Badge tone={badge.tone} className="mt-1">Trust score {trustScore}/100</Badge>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600" style={{ width: `${trustScore}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Invoices Issued" value={invoices.length} icon={FileText} tone="brand" />
        <StatCard label="Paid Invoices" value={paidInvoices} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Completed Transactions" value={completedTx} icon={Repeat} tone="accent" />
        <StatCard label="Health Score" value={`${healthScore}/100`} icon={ShieldCheck} tone="amber" />
      </div>

      <div className="card mt-4 flex items-start gap-3 border-brand-500/20 bg-brand-500/5 p-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-500">
          <Info className="h-5 w-5" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This Business Passport helps customers, suppliers, lenders, and partners verify the credibility of a
          business using AI-powered performance insights and blockchain-backed records. Your identity is portable
          and your track record is verifiable — without exposing sensitive financial details.
        </p>
      </div>
    </Page>
  );
}
