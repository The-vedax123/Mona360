export function formatCurrency(amount, currency = 'ZMW') {
  const value = Number(amount || 0);
  const symbolMap = { ZMW: 'K', USD: '$', EUR: '€', GBP: '£', NGN: '₦', KES: 'KSh', ZAR: 'R' };
  const symbol = symbolMap[currency] || `${currency} `;
  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(n) {
  return Number(n || 0).toLocaleString();
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatRelative(value) {
  if (!value) return '';
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  const day = 86_400_000;
  if (diff < day) return 'Today';
  if (diff < 2 * day) return 'Yesterday';
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return formatDate(value);
}

export function truncateMiddle(str, front = 6, back = 4) {
  if (!str) return '';
  if (str.length <= front + back + 3) return str;
  return `${str.slice(0, front)}…${str.slice(-back)}`;
}
