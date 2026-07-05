import { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  QrCode,
  Wallet as WalletIcon,
  ShieldCheck,
  Link2,
  Coins,
  Copy,
} from 'lucide-react';
import Page from '../components/ui/Page.jsx';
import WalletCard from '../components/WalletCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/ui/Modal.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useBusiness } from '../hooks/useBusiness.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { formatCurrency, formatRelative, truncateMiddle } from '../utils/format.js';
import { generatePaymentProofHash } from '../utils/blockchain.js';

export default function Wallet() {
  const { business, walletTransactions, addRecord, connectWallet, disconnectWallet } = useBusiness();
  const toast = useToast();
  const currency = business?.currency || 'ZMW';
  const connected = !!business?.wallet_address;

  const [modal, setModal] = useState(null); // 'send' | 'receive' | 'qr'
  const [form, setForm] = useState({ amount: '', address: '' });

  const balance = useMemo(
    () =>
      walletTransactions.reduce(
        (sum, t) => sum + (t.transaction_type === 'received' ? Number(t.amount) : -Number(t.amount)),
        0
      ),
    [walletTransactions]
  );

  const usdRate = 0.037; // demo placeholder ZMW→USD
  const stablecoin = (balance * usdRate).toFixed(2);

  const handleConnect = () => {
    const addr = connectWallet();
    toast.success(`Wallet connected · ${truncateMiddle(addr)}`);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.info('Wallet disconnected');
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(business.wallet_address);
      toast.success('Wallet address copied');
    } catch {
      toast.info(business.wallet_address);
    }
  };

  const submitTx = (type) => (e) => {
    e.preventDefault();
    if (!form.amount) {
      toast.warning('Enter an amount');
      return;
    }
    addRecord('walletTransactions', {
      transaction_type: type,
      amount: Number(form.amount),
      currency,
      wallet_address: form.address || truncateMiddle(business?.wallet_address || '0x0000', 6, 4),
      transaction_hash: generatePaymentProofHash(),
      status: 'confirmed',
    });
    toast.success(type === 'received' ? 'Payment received & verified' : 'Payment sent & verified');
    setForm({ amount: '', address: '' });
    setModal(null);
  };

  return (
    <Page title="Wallet" subtitle="Your business finance wallet — with verified payment proofs.">
      {!connected && (
        <div className="card mb-4 flex flex-col items-start justify-between gap-3 border-brand-500/30 bg-brand-500/5 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-500">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Connect a wallet (optional)</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Link a wallet to give your business a portable identity. You can use everything without it.
              </p>
            </div>
          </div>
          <button onClick={handleConnect} className="btn-primary">
            <WalletIcon className="h-4 w-4" /> Connect Wallet
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WalletCard
            balance={balance}
            currency={currency}
            address={business?.wallet_address}
            connected={connected}
            onCopy={copyAddress}
            onDisconnect={handleDisconnect}
          />

          <div className="mt-4 grid grid-cols-3 gap-3">
            <button onClick={() => setModal('receive')} className="card flex flex-col items-center gap-2 p-4 transition hover:-translate-y-0.5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-500"><ArrowDownLeft className="h-5 w-5" /></span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Receive</span>
            </button>
            <button onClick={() => setModal('send')} className="card flex flex-col items-center gap-2 p-4 transition hover:-translate-y-0.5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-500"><ArrowUpRight className="h-5 w-5" /></span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Send</span>
            </button>
            <button onClick={() => setModal('qr')} className="card flex flex-col items-center gap-2 p-4 transition hover:-translate-y-0.5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-500/15 text-accent-500"><QrCode className="h-5 w-5" /></span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">QR</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <Coins className="h-4 w-4 text-accent-500" /> Balances
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Local currency</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(balance, currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Stablecoin (USDC)</span>
                <span className="font-bold text-slate-900 dark:text-white">${stablecoin}</span>
              </div>
              <p className="text-[11px] text-slate-400">Stablecoin & FX values are demo placeholders.</p>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Payment Proof
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Every wallet transaction generates a verifiable payment proof — share it with customers and
              suppliers as tamper-evident evidence of payment.
            </p>
          </div>
        </div>
      </div>

      <div className="card mt-4 p-4">
        <h3 className="section-title mb-4">Recent Wallet Transactions</h3>
        {walletTransactions.length ? (
          <div className="space-y-2">
            {walletTransactions.map((t) => {
              const incoming = t.transaction_type === 'received';
              return (
                <div key={t.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${incoming ? 'bg-emerald-500/15 text-emerald-500' : 'bg-brand-500/15 text-brand-500'}`}>
                      {incoming ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </span>
                    <div>
                      <p className="font-semibold capitalize text-slate-900 dark:text-white">{t.transaction_type}</p>
                      <p className="font-mono text-[11px] text-slate-400">{truncateMiddle(t.transaction_hash, 10, 6)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${incoming ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {incoming ? '+' : '-'}{formatCurrency(t.amount, currency)}
                    </p>
                    <div className="flex items-center justify-end gap-1.5">
                      <Badge tone={t.status === 'confirmed' ? 'emerald' : 'amber'} className="capitalize">{t.status}</Badge>
                      <span className="text-[11px] text-slate-400">{formatRelative(t.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={WalletIcon} title="No transactions yet" description="Receive or send a payment to see it here." />
        )}
      </div>

      {/* Send / Receive modal */}
      <Modal
        open={modal === 'send' || modal === 'receive'}
        onClose={() => setModal(null)}
        title={modal === 'send' ? 'Send payment' : 'Receive payment'}
        description="Simulated for the MVP — generates a verified payment proof."
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={submitTx(modal === 'send' ? 'sent' : 'received')} className="btn-primary">
              {modal === 'send' ? 'Send' : 'Record payment'}
            </button>
          </>
        }
      >
        <form onSubmit={submitTx(modal === 'send' ? 'sent' : 'received')} className="space-y-4">
          <div>
            <label className="label">Amount ({currency})</label>
            <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="1000" className="input" required />
          </div>
          <div>
            <label className="label">{modal === 'send' ? 'Recipient' : 'From'} address (optional)</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="0x…" className="input" />
          </div>
        </form>
      </Modal>

      {/* QR modal */}
      <Modal open={modal === 'qr'} onClose={() => setModal(null)} title="Receive via QR" description="Share this code to receive a payment.">
        <div className="flex flex-col items-center gap-4 py-2">
          <QrPlaceholder value={business?.wallet_address || 'businessbrain'} />
          <div className="w-full rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5">
            <p className="text-xs text-slate-400">Your wallet address</p>
            <p className="font-mono text-sm text-slate-700 dark:text-slate-200">{business?.wallet_address ? truncateMiddle(business.wallet_address, 12, 10) : 'Connect a wallet first'}</p>
          </div>
          {business?.wallet_address && (
            <button onClick={copyAddress} className="btn-secondary w-full"><Copy className="h-4 w-4" /> Copy address</button>
          )}
        </div>
      </Modal>
    </Page>
  );
}

/** A lightweight deterministic QR-style placeholder (no external dependency). */
function QrPlaceholder({ value = '' }) {
  const size = 21;
  const cells = [];
  let seed = 0;
  for (let i = 0; i < value.length; i += 1) seed = (seed * 31 + value.charCodeAt(i)) % 1_000_000_007;
  let x = seed || 12345;
  const rand = () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    return x / 0x7fffffff;
  };
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const finder =
        (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
      cells.push(finder ? (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4) ? 1 : 0) : rand() > 0.55 ? 1 : 0);
    }
  }
  return (
    <div className="grid rounded-2xl bg-white p-4 shadow-card" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: 200, height: 200 }}>
      {cells.map((v, i) => (
        <div key={i} style={{ background: v ? '#0b1120' : 'transparent' }} />
      ))}
    </div>
  );
}
