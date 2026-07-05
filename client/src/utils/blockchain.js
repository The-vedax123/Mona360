/**
 * Blockchain-inspired helpers for the MVP trust layer.
 * These generate demo verification hashes and wallet addresses. They are NOT
 * real on-chain records — they exist to demonstrate the "verifiable records"
 * UX and can later be swapped for real chain interactions.
 */

const HEX = '0123456789abcdef';

function randomHex(len) {
  let out = '';
  for (let i = 0; i < len; i += 1) out += HEX[Math.floor(Math.random() * 16)];
  return out;
}

export function generateWalletAddress() {
  return `0x${randomHex(40)}`;
}

export function generateInvoiceHash() {
  return `0xINV-${randomHex(20).toUpperCase()}`;
}

export function generatePaymentProofHash() {
  return `0xPAY-${randomHex(16)}`;
}

export function generateTransactionHash() {
  return `0x${randomHex(24)}`;
}

/** A simple, readable trust "badge" derived from a score. */
export function trustBadge(score) {
  if (score >= 85) return { label: 'Trusted Business', tone: 'emerald' };
  if (score >= 70) return { label: 'Verified Business', tone: 'brand' };
  if (score >= 50) return { label: 'Growing Business', tone: 'amber' };
  return { label: 'New Business', tone: 'slate' };
}
