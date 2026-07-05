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

  return {
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
    inventoryRiskLevel: risk.level,
    salesCount: sales.length,
    expenseCount: expenses.length,
    invoicesIssued: invoices.length,
    paidInvoices: invoices.filter((i) => i.status === 'paid').length,
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
    title: 'AI Business Report',
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
  'Can I afford to hire someone?',
  'Which product is performing best?',
  'What expenses are too high?',
  'How can I increase sales?',
];

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
