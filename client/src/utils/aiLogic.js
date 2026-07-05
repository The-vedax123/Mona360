import {
  totalRevenue,
  totalExpenses,
  netProfit,
  profitMargin,
  bestSellingProduct,
  highestExpenseCategory,
  lowStockProducts,
  deadStockProducts,
  highProfitItems,
  inventoryRisk,
  cashFlowStatus,
  businessHealthScore,
  businessTrustScore,
} from './calculations.js';

/**
 * Distil the full business state into a compact metrics object that both the
 * on-device insight generator and the backend advisor can consume.
 */
export function computeMetrics(state = {}) {
  const { business = {}, sales = [], expenses = [], inventory = [], invoices = [], walletTransactions = [] } = state;
  const revenue = totalRevenue(sales);
  const expensesTotal = totalExpenses(expenses);
  const profit = netProfit(sales, expenses);
  const margin = profitMargin(sales, expenses);
  const risk = inventoryRisk(inventory);
  const cash = cashFlowStatus(sales, expenses);
  const health = businessHealthScore({ sales, expenses, inventory });
  const trust = businessTrustScore({ business, invoices, walletTransactions, healthScore: health });
  const low = lowStockProducts(inventory);
  const dead = deadStockProducts(inventory, sales);
  const unpaid = invoices.filter((i) => i.status !== 'paid');
  const walletBalance = walletTransactions.reduce(
    (sum, t) => sum + (t.transaction_type === 'received' ? Number(t.amount || 0) : -Number(t.amount || 0)),
    0
  );

  return {
    businessName: business.business_name || 'your business',
    currency: business.currency || 'ZMW',
    totalRevenue: revenue,
    totalExpenses: expensesTotal,
    netProfit: profit,
    profitMargin: margin,
    healthScore: health,
    trustScore: trust,
    cashFlowStatus: cash.label,
    bestSellingProduct: bestSellingProduct(sales),
    highestExpenseCategory: highestExpenseCategory(expenses),
    lowStockProducts: low.map((i) => i.product_name),
    deadStockProducts: dead.map((i) => i.product_name),
    inventoryRiskLevel: risk.level,
    salesCount: sales.length,
    expenseCount: expenses.length,
    inventoryCount: inventory.length,
    invoicesIssued: invoices.length,
    paidInvoices: invoices.filter((i) => i.status === 'paid').length,
    unpaidInvoicesCount: unpaid.length,
    unpaidInvoicesTotal: unpaid.reduce((s, i) => s + Number(i.total_amount || 0), 0),
    walletBalance,
  };
}

const uid = () => `ins_${Math.random().toString(36).slice(2, 10)}`;

/**
 * Generate prioritised, human-readable AI insights entirely on-device from the
 * real business data. Used on the dashboard and AI advisor page.
 */
export function generateInsights(state = {}) {
  const { sales = [], expenses = [], inventory = [] } = state;
  const revenue = totalRevenue(sales);
  const expensesTotal = totalExpenses(expenses);
  const profit = netProfit(sales, expenses);
  const margin = profitMargin(sales, expenses);
  const low = lowStockProducts(inventory);
  const dead = deadStockProducts(inventory, sales);
  const best = bestSellingProduct(sales);
  const topExpense = highestExpenseCategory(expenses);
  const highProfit = highProfitItems(inventory).slice(0, 1)[0];

  const insights = [];

  if (expensesTotal > revenue && revenue > 0) {
    insights.push({
      id: uid(),
      insight_type: 'risk',
      title: 'Expenses exceed revenue',
      message:
        'Your expenses are currently higher than your revenue. Reduce non-essential costs and focus on your best-selling products.',
      priority: 'high',
    });
  } else if (profit > 0 && margin >= 15) {
    insights.push({
      id: uid(),
      insight_type: 'growth',
      title: 'Your business is performing well',
      message:
        'Your business is performing well. Consider reinvesting part of your profit into marketing or inventory expansion.',
      priority: 'low',
    });
  }

  if (low.length) {
    insights.push({
      id: uid(),
      insight_type: 'inventory',
      title: `${low.length} product(s) below reorder level`,
      message: `Some products are below reorder level (${low
        .slice(0, 3)
        .map((i) => i.product_name)
        .join(', ')}). Restock soon to avoid losing sales.`,
      priority: 'high',
    });
  }

  if (dead.length) {
    insights.push({
      id: uid(),
      insight_type: 'inventory',
      title: 'Dead stock detected',
      message: `${dead
        .slice(0, 3)
        .map((i) => i.product_name)
        .join(', ')} ${dead.length === 1 ? 'has' : 'have'} stock but no recent sales. Consider a promotion to free up cash.`,
      priority: 'medium',
    });
  }

  if (best) {
    insights.push({
      id: uid(),
      insight_type: 'sales',
      title: `"${best}" is your top performer`,
      message: `"${best}" is generating the most revenue. Keep it well-stocked and feature it prominently to grow sales.`,
      priority: 'low',
    });
  }

  if (topExpense) {
    insights.push({
      id: uid(),
      insight_type: 'expense',
      title: `Largest cost: ${topExpense}`,
      message: `"${topExpense}" is your biggest expense category. Review it for savings — even a 10% reduction improves your bottom line.`,
      priority: 'medium',
    });
  }

  if (highProfit && highProfit.unitProfit > 0) {
    insights.push({
      id: uid(),
      insight_type: 'growth',
      title: `High-margin item: ${highProfit.product_name}`,
      message: `"${highProfit.product_name}" has one of your best unit margins (${highProfit.margin.toFixed(
        0
      )}%). Prioritise stocking and promoting it.`,
      priority: 'low',
    });
  }

  if (!insights.length) {
    insights.push({
      id: uid(),
      insight_type: 'info',
      title: 'Start recording data',
      message: 'Add sales, expenses and inventory to unlock personalised AI insights about your business.',
      priority: 'low',
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return insights.sort((a, b) => order[a.priority] - order[b.priority]);
}

/** Local fallback for the AI report when the backend is unreachable. */
export function localBusinessReport(metrics) {
  const c = metrics.currency || 'ZMW';
  const fmt = (n) => `${c} ${Number(n || 0).toLocaleString()}`;
  const profit = metrics.netProfit || 0;
  const improved = [];
  const declined = [];
  const risks = [];
  const nextActions = [];

  if (profit >= 0) improved.push(`Net profit is positive at ${fmt(profit)} (${(metrics.profitMargin || 0).toFixed(1)}% margin).`);
  else declined.push(`Operating at a loss of ${fmt(Math.abs(profit))}.`);
  if (metrics.bestSellingProduct) improved.push(`"${metrics.bestSellingProduct}" is driving the most revenue.`);
  if (metrics.totalRevenue > 0) improved.push(`Recorded ${fmt(metrics.totalRevenue)} in total revenue.`);

  if (metrics.totalExpenses > metrics.totalRevenue) {
    declined.push(`Expenses (${fmt(metrics.totalExpenses)}) exceed revenue (${fmt(metrics.totalRevenue)}).`);
    risks.push('Sustained spending above revenue will erode cash reserves.');
    nextActions.push('Cut non-essential expenses and renegotiate your largest cost.');
  }
  if (metrics.highestExpenseCategory) risks.push(`"${metrics.highestExpenseCategory}" is your largest cost centre.`);
  if (metrics.lowStockProducts?.length) {
    risks.push(`${metrics.lowStockProducts.length} product(s) below reorder level: ${metrics.lowStockProducts.slice(0, 4).join(', ')}.`);
    nextActions.push('Restock low inventory to protect sales.');
  }
  if ((metrics.profitMargin || 0) >= 15 && profit > 0) nextActions.push('Reinvest a portion of profit into marketing or inventory.');
  if (metrics.bestSellingProduct) nextActions.push(`Promote "${metrics.bestSellingProduct}" to accelerate revenue.`);
  nextActions.push('Send outstanding invoices promptly to improve cash flow.');

  return {
    title: 'Mona AI Report',
    generatedAt: new Date().toISOString(),
    headline: `Health Score ${metrics.healthScore ?? 0}/100 — net ${profit >= 0 ? 'profit' : 'loss'} of ${fmt(Math.abs(profit))} at a ${(metrics.profitMargin || 0).toFixed(1)}% margin.`,
    sections: {
      improved: improved.length ? improved : ['Not enough history yet — keep recording data.'],
      declined: declined.length ? declined : ['No notable declines detected.'],
      risks: risks.length ? risks : ['No major risks detected right now.'],
      nextActions,
    },
    mode: 'local',
  };
}

export const SUGGESTED_PROMPTS = [
  'How is my business doing?',
  'What should I improve this week?',
  'Can I afford to restock?',
  'What expenses are too high?',
  'Which products need attention?',
  'How can I increase profit?',
  'What is my biggest risk?',
  'Summarize my business today.',
];

/**
 * Client-side structured advisor fallback used when the backend is unreachable
 * (e.g. a static-only deployment). Mirrors the server's format so the demo
 * never breaks, and adapts to the user's question + business metrics.
 */
export function localAdvisorResponse(metrics, message) {
  const m = metrics || {};
  const c = m.currency || 'ZMW';
  const sym = { ZMW: 'K', USD: '$', EUR: '€', GBP: '£', NGN: '₦', KES: 'KSh', ZAR: 'R' }[c] || `${c} `;
  const money = (n) => `${sym}${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const t = (message || '').toLowerCase();
  const loss = (m.netProfit || 0) < 0;
  const low = m.lowStockProducts || [];
  const unpaidCount = m.unpaidInvoicesCount || 0;

  const risk = loss || (m.healthScore || 0) < 50 ? 'High' : (m.healthScore || 0) < 70 || low.length || unpaidCount ? 'Medium' : 'Low';

  const findings = [
    `Revenue: ${money(m.totalRevenue)}`,
    `Expenses: ${money(m.totalExpenses)}`,
    `Net ${loss ? 'loss' : 'profit'}: ${money(Math.abs(m.netProfit || 0))} (${(m.profitMargin || 0).toFixed(1)}% margin)`,
    `Health score: ${m.healthScore || 0}/100`,
  ];
  if (low.length) findings.push(`Low stock: ${low.join(', ')}`);
  if (unpaidCount) findings.push(`Unpaid invoices: ${unpaidCount} worth ${money(m.unpaidInvoicesTotal)}`);
  if (m.bestSellingProduct) findings.push(`Best seller: ${m.bestSellingProduct}`);

  let summary;
  const actions = [];
  if (t.includes('restock') || t.includes('afford')) {
    summary = loss
      ? `Restocking is risky — you are operating at a loss of ${money(Math.abs(m.netProfit || 0))}. Prioritise cash first and restock only fast-movers.`
      : `You can restock carefully. Wallet balance is ${money(m.walletBalance)}. Restock fast-moving items first.`;
    if (low.length) actions.push(`Restock priority items: ${low.slice(0, 3).join(', ')}.`);
    if (unpaidCount) actions.push(`Collect ${money(m.unpaidInvoicesTotal)} in unpaid invoices to fund it.`);
    actions.push('Avoid restocking items that are not selling.');
  } else if (t.includes('expense') || t.includes('cost')) {
    const ratio = m.totalRevenue ? (m.totalExpenses / m.totalRevenue) * 100 : 0;
    summary = `Your expenses are ${money(m.totalExpenses)} — about ${ratio.toFixed(0)}% of revenue. ${m.totalExpenses > m.totalRevenue ? 'That is too high and must be reduced.' : 'That is workable, but watch your biggest category.'}`;
    if (m.highestExpenseCategory) actions.push(`Review "${m.highestExpenseCategory}", your largest cost.`);
    actions.push('Pause non-essential spending this week.');
  } else if (t.includes('product') || t.includes('attention') || t.includes('stock')) {
    summary = low.length ? `${low.length} product(s) need attention — they are low on stock.` : 'Your product mix looks healthy right now.';
    if (low.length) actions.push(`Restock soon: ${low.slice(0, 4).join(', ')}.`);
    if (m.bestSellingProduct) actions.push(`Keep "${m.bestSellingProduct}" well stocked.`);
  } else if (t.includes('profit') || t.includes('increase')) {
    summary = loss ? `You are at a loss of ${money(Math.abs(m.netProfit || 0))}. Cut costs and push your best seller to reach profit.` : `Your net profit is ${money(m.netProfit)} at a ${(m.profitMargin || 0).toFixed(1)}% margin. Grow revenue while holding costs.`;
    if (m.bestSellingProduct) actions.push(`Sell more of "${m.bestSellingProduct}".`);
    if (m.highestExpenseCategory) actions.push(`Trim "${m.highestExpenseCategory}" to widen margin.`);
  } else if (t.includes('risk') || t.includes('problem')) {
    summary = loss ? `Your biggest risk is operating at a loss of ${money(Math.abs(m.netProfit || 0))}.` : low.length ? `Your biggest risk is low stock on ${low.length} product(s).` : `No major risks detected. Health score ${m.healthScore || 0}/100.`;
    if (unpaidCount) actions.push('Follow up on unpaid invoices.');
    if (low.length) actions.push(`Restock ${low.slice(0, 3).join(', ')}.`);
    if (!actions.length) actions.push('Keep monitoring your health score.');
  } else {
    summary = loss
      ? `Your business needs attention. Expenses are higher than revenue, so you are at a loss of ${money(Math.abs(m.netProfit || 0))}. Health score ${m.healthScore || 0}/100.`
      : `${m.businessName || 'Your business'} is doing well. Net profit ${money(m.netProfit)} at ${(m.profitMargin || 0).toFixed(1)}% margin, health score ${m.healthScore || 0}/100.`;
    if (unpaidCount) actions.push('Follow up on unpaid invoices to improve cash flow.');
    if (m.totalExpenses > m.totalRevenue) actions.push('Reduce non-essential expenses this week.');
    if (low.length) actions.push(`Restock fast movers: ${low.slice(0, 3).join(', ')}.`);
    if (loss) actions.push('Avoid adding new costs until revenue improves.');
    else actions.push('Reinvest part of your profit carefully.');
  }

  const reply = [
    summary,
    '',
    'Key findings:',
    ...findings.map((f) => `- ${f}`),
    '',
    'Recommended actions:',
    ...actions.map((a, i) => `${i + 1}. ${a}`),
    '',
    `Risk level: ${risk}`,
  ].join('\n');

  return { reply, riskLevel: risk, mode: 'offline' };
}

/**
 * Local fallback for the advisor chat when the backend is unreachable.
 * Mirrors the server's intent logic so the demo never breaks.
 */
export function localAdvisorReply(message, metrics) {
  const text = message.toLowerCase();
  const c = metrics.currency || 'ZMW';
  const fmt = (n) => `${c} ${Number(n || 0).toLocaleString()}`;

  if (text.includes('hire') || text.includes('staff') || text.includes('employee')) {
    const ok = metrics.netProfit > 0 && metrics.profitMargin >= 15;
    return {
      title: ok ? 'You may be able to hire' : 'Hiring looks risky right now',
      message: `Net profit ${fmt(metrics.netProfit)} at ${metrics.profitMargin?.toFixed(1)}% margin. ${
        ok
          ? 'A part-time hire that boosts sales could pay for itself — start small and measure.'
          : 'Grow revenue or margin before taking on a fixed salary.'
      }`,
    };
  }
  if (text.includes('expense') || text.includes('cost') || text.includes('reduce')) {
    return {
      title: 'Expense review',
      message: `Your largest cost is ${metrics.highestExpenseCategory || 'unknown'}. Total expenses ${fmt(
        metrics.totalExpenses
      )} against ${fmt(metrics.totalRevenue)} revenue.`,
    };
  }
  if (text.includes('best') || text.includes('product')) {
    return {
      title: 'Best performing product',
      message: metrics.bestSellingProduct
        ? `"${metrics.bestSellingProduct}" leads on revenue. Keep it stocked and promote it.`
        : 'Add some sales and I will identify your top product.',
    };
  }
  if (text.includes('stock') || text.includes('inventory')) {
    return {
      title: 'Inventory status',
      message: metrics.lowStockProducts?.length
        ? `${metrics.lowStockProducts.length} item(s) need restocking: ${metrics.lowStockProducts
            .slice(0, 3)
            .join(', ')}.`
        : 'Your stock levels look healthy right now.',
    };
  }
  if (text.includes('increase') || text.includes('sales') || text.includes('grow')) {
    return {
      title: 'Ways to increase sales',
      message: `Promote ${metrics.bestSellingProduct || 'your hero product'}, offer a small bundle, and follow up with recent customers for referrals.`,
    };
  }
  return {
    title: 'Business overview',
    message: `Health Score ${metrics.healthScore}/100. Revenue ${fmt(metrics.totalRevenue)}, expenses ${fmt(
      metrics.totalExpenses
    )}, net ${metrics.netProfit >= 0 ? 'profit' : 'loss'} ${fmt(Math.abs(metrics.netProfit))}.`,
  };
}
