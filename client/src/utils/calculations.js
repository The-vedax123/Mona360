/** Core business-metric calculations used across the dashboard and AI layer. */

export function totalRevenue(sales = []) {
  return sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
}

export function totalExpenses(expenses = []) {
  return expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
}

export function netProfit(sales = [], expenses = []) {
  return totalRevenue(sales) - totalExpenses(expenses);
}

export function profitMargin(sales = [], expenses = []) {
  const rev = totalRevenue(sales);
  if (!rev) return 0;
  return (netProfit(sales, expenses) / rev) * 100;
}

export function bestSellingProduct(sales = []) {
  if (!sales.length) return null;
  const totals = {};
  for (const s of sales) {
    totals[s.product_name] = (totals[s.product_name] || 0) + Number(s.amount || 0);
  }
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
}

export function highestExpenseCategory(expenses = []) {
  if (!expenses.length) return null;
  const totals = {};
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount || 0);
  }
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
}

export function expensesByCategory(expenses = []) {
  const totals = {};
  for (const e of expenses) {
    totals[e.category || 'Other'] = (totals[e.category || 'Other'] || 0) + Number(e.amount || 0);
  }
  return Object.entries(totals).map(([name, value]) => ({ name, value }));
}

export function lowStockProducts(inventory = []) {
  return inventory.filter((i) => Number(i.quantity) <= Number(i.reorder_level));
}

export function deadStockProducts(inventory = [], sales = []) {
  const soldNames = new Set(sales.map((s) => s.product_name));
  return inventory.filter((i) => !soldNames.has(i.product_name) && Number(i.quantity) > 0);
}

export function highProfitItems(inventory = []) {
  return [...inventory]
    .map((i) => ({
      ...i,
      unitProfit: Number(i.selling_price || 0) - Number(i.buying_price || 0),
      margin: i.selling_price ? ((i.selling_price - i.buying_price) / i.selling_price) * 100 : 0,
    }))
    .sort((a, b) => b.unitProfit - a.unitProfit);
}

export function inventoryValue(inventory = []) {
  return inventory.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.buying_price || 0), 0);
}

/** Inventory risk: proportion of SKUs at/below reorder level. */
export function inventoryRisk(inventory = []) {
  if (!inventory.length) return { level: 'none', score: 0, lowCount: 0 };
  const low = lowStockProducts(inventory).length;
  const ratio = low / inventory.length;
  let level = 'low';
  if (ratio >= 0.5) level = 'high';
  else if (ratio >= 0.25) level = 'medium';
  return { level, score: Math.round(ratio * 100), lowCount: low };
}

export function cashFlowStatus(sales = [], expenses = []) {
  const profit = netProfit(sales, expenses);
  if (profit > 0) return { label: 'Positive', tone: 'emerald', profit };
  if (profit === 0) return { label: 'Break-even', tone: 'amber', profit };
  return { label: 'Negative', tone: 'red', profit };
}

/**
 * Mona360 Health Score (0–100). A weighted blend of profitability, margin,
 * inventory health and cash flow.
 */
export function businessHealthScore({ sales = [], expenses = [], inventory = [] } = {}) {
  const rev = totalRevenue(sales);
  const margin = profitMargin(sales, expenses);
  const profit = netProfit(sales, expenses);
  const risk = inventoryRisk(inventory);

  let score = 50;

  // Profitability (up to +30 / -30)
  if (profit > 0) score += Math.min(30, (margin / 30) * 30);
  else score -= 25;

  // Revenue traction (up to +12)
  if (rev > 0) score += Math.min(12, Math.log10(rev + 1) * 3);

  // Inventory health (up to -18)
  score -= (risk.score / 100) * 18;

  // Cash-flow bonus
  if (profit > 0) score += 6;

  score = Math.max(0, Math.min(100, Math.round(score)));
  return score;
}

export function healthLabel(score) {
  if (score >= 90) return { label: 'Excellent', tone: 'emerald' };
  if (score >= 70) return { label: 'Good', tone: 'brand' };
  if (score >= 50) return { label: 'Warning', tone: 'amber' };
  return { label: 'Critical', tone: 'red' };
}

/**
 * Mona360 Trust Score (0–100) — the reputation number surfaced on the
 * Mona360 Passport. Blends verification, invoice payment behaviour, wallet
 * activity and overall health.
 */
export function businessTrustScore({ business = {}, invoices = [], walletTransactions = [], healthScore = 0 } = {}) {
  let score = 40;
  if (business.verification_status === 'verified') score += 20;
  if (business.wallet_address) score += 10;

  const paid = invoices.filter((i) => i.status === 'paid').length;
  if (invoices.length) score += Math.min(15, (paid / invoices.length) * 15);

  const confirmedTx = walletTransactions.filter((t) => t.status === 'confirmed').length;
  score += Math.min(8, confirmedTx * 2);

  score += (healthScore / 100) * 7;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Revenue vs expenses grouped by day for trend charts. */
export function buildTrend(sales = [], expenses = [], days = 14) {
  const buckets = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.push({
      key,
      label: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      revenue: 0,
      expenses: 0,
      profit: 0,
    });
  }
  const index = Object.fromEntries(buckets.map((b, i) => [b.key, i]));
  for (const s of sales) {
    const key = (s.sale_date || s.created_at || '').slice(0, 10);
    if (key in index) buckets[index[key]].revenue += Number(s.amount || 0);
  }
  for (const e of expenses) {
    const key = (e.expense_date || e.created_at || '').slice(0, 10);
    if (key in index) buckets[index[key]].expenses += Number(e.amount || 0);
  }
  for (const b of buckets) b.profit = b.revenue - b.expenses;
  return buckets;
}
