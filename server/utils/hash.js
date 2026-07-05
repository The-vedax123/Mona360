import crypto from 'node:crypto';

/**
 * Generate a demo, blockchain-style verification hash for a record.
 * This is a deterministic, non-cryptographic-proof placeholder used for the
 * MVP's "Verified payment proof" and invoice verification features.
 */
export function generateVerificationHash(prefix, seed) {
  const digest = crypto
    .createHash('sha256')
    .update(`${prefix}:${seed}:${Date.now()}`)
    .digest('hex');
  return `0x${prefix.toUpperCase()}-${digest.slice(0, 24)}`;
}
