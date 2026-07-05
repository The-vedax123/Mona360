/**
 * Server-side business metric calculations.
 * Mirrors the client calculations so the AI advisor works identically whether
 * data comes from Supabase (server) or from client-provided context.
 */

const num = (v) => Number(v || 0);

export function computeMetricsFromData(data = {}) {
  const {
    business = {},
    sales = [],
    expenses = [],
    inventory = [],
    invoices = [],
    walletTransactions = [],
  } = data;

  const totalRevenue = sales.reduce((s, x) => s + num(x.amount), 0);
  const totalExpenses = expenses.reduce((s, x) => s + num(x.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue ? (netProfit / totalRevenue) * 100 : 0;

  // Best-selling product by revenue
  const salesByProduct = {};
  for (const s of sales) salesByProduct[s.product_name] = (salesByProduct[s.product_name] || 0) + num(s.amount);
  const bestSellingProduct =
    Object.entries(salesByProduct).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Highest expense category
  const expenseByCat = {};
  for (const e of expenses) expenseByCat[e.category || 'Other'] = (expenseByCat[e.category || 'Other'] || 0) + num(e.amount);
  const highestExpenseCategory =
    Object.entries(expenseByCat).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const lowStock = inventory.filter((i) => num(i.quantity) <= num(i.reorder_level));
  const lowStockProducts = lowStock.map((i) => i.product_name);

  const soldNames = new Set(sales.map((s) => s.product_name));
  const deadStockProducts = inventory
    .filter((i) => !soldNames.has(i.product_name) && num(i.quantity) > 0)
    .map((i) => i.product_name);

  const unpaid = invoices.filter((i) => i.status !== 'paid');
  const unpaidInvoicesCount = unpaid.length;
  const unpaidInvoicesTotal = unpaid.reduce((s, i) => s + num(i.total_amount), 0);
  const paidInvoices = invoices.filter((i) => i.status === 'paid').length;

  const walletBalance = walletTransactions.reduce(
    (s, t) => s + (t.transaction_type === 'received' ? num(t.amount) : -num(t.amount)),
    0
  );

  // Inventory risk
  let riskLevel = 'low';
  if (inventory.length) {
    const ratio = lowStock.length / inventory.length;
    if (ratio >= 0.5) riskLevel = 'high';
    else if (ratio >= 0.25) riskLevel = 'medium';
  }

  const healthScore = computeHealthScore({ totalRevenue, totalExpenses, netProfit, profitMargin, inventory, lowStock });
  const trustScore = computeTrustScore({ business, invoices, paidInvoices, walletTransactions, healthScore });

  return {
    businessName: business.business_name || 'your business',
    currency: business.currency || 'ZMW',
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    bestSellingProduct,
    highestExpenseCategory,
    lowStockProducts,
    deadStockProducts,
    unpaidInvoicesCount,
    unpaidInvoicesTotal,
    invoicesIssued: invoices.length,
    paidInvoices,
    walletBalance,
    salesCount: sales.length,
    expenseCount: expenses.length,
    inventoryCount: inventory.length,
    inventoryRiskLevel: riskLevel,
    cashFlowStatus: netProfit > 0 ? 'Positive' : netProfit === 0 ? 'Break-even' : 'Negative',
    healthScore,
    trustScore,
  };
}

function computeHealthScore({ totalRevenue, netProfit, profitMargin, inventory, lowStock }) {
  let score = 50;
  if (netProfit > 0) score += Math.min(30, (profitMargin / 30) * 30);
  else score -= 25;
  if (totalRevenue > 0) score += Math.min(12, Math.log10(totalRevenue + 1) * 3);
  if (inventory.length) score -= (lowStock.length / inventory.length) * 18;
  if (netProfit > 0) score += 6;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function computeTrustScore({ business, invoices, paidInvoices, walletTransactions, healthScore }) {
  let score = 40;
  if (business.verification_status === 'verified') score += 20;
  if (business.wallet_address) score += 10;
  if (invoices.length) score += Math.min(15, (paidInvoices / invoices.length) * 15);
  const confirmed = walletTransactions.filter((t) => t.status === 'confirmed').length;
  score += Math.min(8, confirmed * 2);
  score += (healthScore / 100) * 7;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function healthLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Warning';
  return 'Critical';
}

/** Normalise a client-provided context object into the metrics shape. */
export function normalizeContext(context = {}) {
  return {
    businessName: context.businessName || 'your business',
    currency: context.currency || 'ZMW',
    totalRevenue: num(context.totalRevenue),
    totalExpenses: num(context.totalExpenses),
    netProfit: context.netProfit != null ? num(context.netProfit) : num(context.totalRevenue) - num(context.totalExpenses),
    profitMargin: num(context.profitMargin),
    bestSellingProduct: context.bestSellingProduct || null,
    highestExpenseCategory: context.highestExpenseCategory || null,
    lowStockProducts: Array.isArray(context.lowStockProducts) ? context.lowStockProducts : [],
    deadStockProducts: Array.isArray(context.deadStockProducts) ? context.deadStockProducts : [],
    unpaidInvoicesCount: num(context.unpaidInvoicesCount),
    unpaidInvoicesTotal: num(context.unpaidInvoicesTotal),
    invoicesIssued: num(context.invoicesIssued),
    paidInvoices: num(context.paidInvoices),
    walletBalance: num(context.walletBalance),
    salesCount: num(context.salesCount),
    expenseCount: num(context.expenseCount),
    inventoryCount: num(context.inventoryCount),
    inventoryRiskLevel: context.inventoryRiskLevel || 'low',
    cashFlowStatus: context.cashFlowStatus || (num(context.netProfit) >= 0 ? 'Positive' : 'Negative'),
    healthScore: num(context.healthScore),
    trustScore: num(context.trustScore),
  };
}
