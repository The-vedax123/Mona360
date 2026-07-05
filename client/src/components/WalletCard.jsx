import { Wallet, Copy, ShieldCheck, Link2Off } from 'lucide-react';
import { formatCurrency, truncateMiddle } from '../utils/format.js';

export default function WalletCard({ balance, currency = 'ZMW', address, connected, onCopy, onDisconnect }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-6 text-white shadow-glow">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-black/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-white/80">
            <Wallet className="h-4 w-4" /> BusinessBrain Wallet
          </div>
          {connected ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
              <Link2Off className="h-3.5 w-3.5" /> Not connected
            </span>
          )}
        </div>

        <p className="mt-6 text-sm text-white/70">Business balance</p>
        <p className="text-4xl font-extrabold tracking-tight">{formatCurrency(balance, currency)}</p>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60">Wallet address</p>
            <p className="font-mono text-sm">{address ? truncateMiddle(address, 8, 6) : 'Not linked'}</p>
          </div>
          <div className="flex items-center gap-2">
            {address && (
              <button
                onClick={onCopy}
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 transition hover:bg-white/25"
                aria-label="Copy wallet address"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
            {connected && onDisconnect && (
              <button
                onClick={onDisconnect}
                className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold transition hover:bg-white/25"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
