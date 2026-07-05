/**
 * BusinessBrain AI — advisor service.
 *
 * When no LLM API key is configured, this produces smart, data-driven
 * responses derived from the business metrics the client sends. The intent
 * detection + templating below is intentionally deterministic so demos are
 * reliable and every answer references the user's real numbers.
 */

function money(amount, currency = 'ZMW') {
  const value = Number(amount || 0);
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function pct(n) {
  return `${Number(n || 0).toFixed(1)}%`;
}

const INTENTS = [
  { key: 'overview', patterns: ['how is my business', 'how am i doing', 'overview', 'summary', 'performing'] },
  { key: 'improve', patterns: ['improve', 'this week', 'better', 'grow'] },
  { key: 'hire', patterns: ['hire', 'employee', 'staff', 'afford someone', 'afford to hire'] },
  { key: 'bestProduct', patterns: ['best', 'top product', 'performing best', 'best-selling', 'best selling'] },
  { key: 'expenses', patterns: ['expense', 'too high', 'cost', 'spending', 'reduce'] },
  { key: 'sales', patterns: ['increase sales', 'more sales', 'revenue', 'sell more'] },
  { key: 'inventory', patterns: ['stock', 'inventory', 'restock', 'reorder'] },
  { key: 'cashflow', patterns: ['cash flow', 'cashflow', 'liquidity', 'runway'] },
];

function detectIntent(message) {
  const text = message.toLowerCase();
  for (const intent of INTENTS) {
    if (intent.patterns.some((p) => text.includes(p))) return intent.key;
  }
  return 'overview';
}

function buildReply(intent, m) {
  const currency = m.currency || 'ZMW';
  const revenue = m.totalRevenue || 0;
  const expenses = m.totalExpenses || 0;
  const profit = m.netProfit ?? revenue - expenses;
  const margin = m.profitMargin ?? (revenue ? (profit / revenue) * 100 : 0);
  const health = m.healthScore ?? 0;
  const lowStock = Array.isArray(m.lowStockProducts) ? m.lowStockProducts : [];

  const suggestions = [
    'What should I improve this week?',
    'Which product is performing best?',
    'What expenses are too high?',
    'How can I increase sales?',
  ];

  switch (intent) {
    case 'improve': {
      const actions = [];
      if (profit < 0) {
        actions.push(
          `Your costs (${money(expenses, currency)}) currently exceed revenue (${money(
            revenue,
            currency
          )}). Trim non-essential spending first.`
        );
      }
      if (m.highestExpenseCategory) {
        actions.push(
          `Review "${m.highestExpenseCategory}" — it is your largest expense category. A 10% cut adds real profit.`
        );
      }
      if (lowStock.length) {
        actions.push(`Restock ${lowStock.slice(0, 3).join(', ')} before you lose sales.`);
      }
      if (m.bestSellingProduct) {
        actions.push(`Double down on "${m.bestSellingProduct}" — promote it and keep it in stock.`);
      }
      if (!actions.length) actions.push('Keep your momentum: reinvest a slice of profit into marketing.');
      return {
        title: 'Focus areas for this week',
        message: `Here are the highest-impact moves based on your current numbers:`,
        bullets: actions,
        suggestions,
      };
    }
    case 'hire': {
      const affordable = profit > 0 && margin >= 15;
      return {
        title: affordable ? 'You may be able to hire' : 'Hiring looks risky right now',
        message: affordable
          ? `Your net profit is ${money(profit, currency)} at a ${pct(
              margin
            )} margin. If a new hire costs less than ~30% of monthly profit and helps you sell more, it can pay for itself. Start part-time and measure impact.`
          : `Your net profit is ${money(profit, currency)} at a ${pct(
              margin
            )} margin. That is thin for a fixed salary. Grow revenue or improve margin first, then revisit hiring.`,
        bullets: [
          `Revenue: ${money(revenue, currency)}`,
          `Net profit: ${money(profit, currency)}`,
          `Margin: ${pct(margin)}`,
        ],
        suggestions,
      };
    }
    case 'bestProduct':
      return {
        title: 'Best performing product',
        message: m.bestSellingProduct
          ? `"${m.bestSellingProduct}" is your top performer by revenue. Keep it well-stocked, feature it prominently, and consider a small bundle to lift the average order value.`
          : `You have not recorded enough sales yet. Add a few sales and I'll identify your top product instantly.`,
        suggestions,
      };
    case 'expenses': {
      const bullets = [];
      if (m.highestExpenseCategory)
        bullets.push(`Largest category: ${m.highestExpenseCategory}.`);
      bullets.push(`Total expenses: ${money(expenses, currency)} vs revenue ${money(revenue, currency)}.`);
      if (expenses > revenue) bullets.push('Expenses exceed revenue — prioritise cost control now.');
      return {
        title: 'Expense review',
        message: `Your expenses represent ${pct(revenue ? (expenses / revenue) * 100 : 0)} of revenue. ${
          expenses > revenue
            ? 'That is unsustainable — cut non-essential costs this month.'
            : 'That is within a workable range, but keep an eye on your largest category.'
        }`,
        bullets,
        suggestions,
      };
    }
    case 'sales':
      return {
        title: 'Ways to increase sales',
        message: `You are at ${money(revenue, currency)} in recorded revenue. To grow:`,
        bullets: [
          m.bestSellingProduct
            ? `Promote "${m.bestSellingProduct}" — it already converts well.`
            : 'Identify a hero product and promote it.',
          'Offer a small bundle or loyalty discount to lift repeat purchases.',
          'Follow up with recent customers for referrals.',
          'Send invoices promptly — faster payment means more working capital.',
        ],
        suggestions,
      };
    case 'inventory':
      return {
        title: 'Inventory status',
        message: lowStock.length
          ? `${lowStock.length} product(s) are at or below their reorder level. Restock ${lowStock
              .slice(0, 4)
              .join(', ')} soon to avoid missed sales.`
          : `Your stock levels look healthy — nothing is below its reorder point right now. Keep monitoring your best-seller so it never runs out.`,
        suggestions,
      };
    case 'cashflow':
      return {
        title: 'Cash flow status',
        message: `Your cash flow is currently ${m.cashFlowStatus || (profit >= 0 ? 'positive' : 'negative')}. ${
          profit >= 0
            ? `You are keeping ${money(profit, currency)} after expenses. Set aside a portion as a buffer.`
            : `You are spending ${money(Math.abs(profit), currency)} more than you earn. Reduce costs or accelerate collections.`
        }`,
        suggestions,
      };
    case 'overview':
    default: {
      const label =
        health >= 90 ? 'excellent' : health >= 70 ? 'good' : health >= 50 ? 'in a warning zone' : 'critical';
      return {
        title: 'Business overview',
        message: `Your Business Health Score is ${health}/100 (${label}). Revenue is ${money(
          revenue,
          currency
        )}, expenses ${money(expenses, currency)}, giving a net ${
          profit >= 0 ? 'profit' : 'loss'
        } of ${money(Math.abs(profit), currency)} at a ${pct(margin)} margin.`,
        bullets: [
          m.bestSellingProduct ? `Top product: ${m.bestSellingProduct}` : 'Add sales to reveal your top product',
          m.highestExpenseCategory
            ? `Biggest cost: ${m.highestExpenseCategory}`
            : 'Add expenses to reveal your biggest cost',
          lowStock.length ? `${lowStock.length} product(s) need restocking` : 'Inventory levels are healthy',
        ],
        suggestions,
      };
    }
  }
}

export async function generateAdvisorReply(message, metrics) {
  const intent = detectIntent(message);
  const reply = buildReply(intent, metrics);
  return {
    ...reply,
    intent,
    generatedAt: new Date().toISOString(),
    mode: 'mock',
  };
}

export async function generateBusinessReport(m) {
  const currency = m.currency || 'ZMW';
  const revenue = m.totalRevenue || 0;
  const expenses = m.totalExpenses || 0;
  const profit = m.netProfit ?? revenue - expenses;
  const margin = m.profitMargin ?? (revenue ? (profit / revenue) * 100 : 0);
  const lowStock = Array.isArray(m.lowStockProducts) ? m.lowStockProducts : [];

  const improved = [];
  const declined = [];
  const risks = [];
  const nextActions = [];

  if (profit >= 0) improved.push(`Net profit is positive at ${money(profit, currency)} (${pct(margin)} margin).`);
  else declined.push(`Operating at a loss of ${money(Math.abs(profit), currency)}.`);

  if (m.bestSellingProduct) improved.push(`"${m.bestSellingProduct}" is driving the most revenue.`);
  if (revenue > 0) improved.push(`Recorded ${money(revenue, currency)} in total revenue.`);

  if (expenses > revenue) {
    declined.push(`Expenses (${money(expenses, currency)}) exceed revenue (${money(revenue, currency)}).`);
    risks.push('Sustained spending above revenue will erode cash reserves.');
    nextActions.push('Cut non-essential expenses and renegotiate your largest cost.');
  }
  if (m.highestExpenseCategory) risks.push(`"${m.highestExpenseCategory}" is your largest cost centre — watch it.`);
  if (lowStock.length) {
    risks.push(`${lowStock.length} product(s) below reorder level: ${lowStock.slice(0, 4).join(', ')}.`);
    nextActions.push('Restock low inventory to protect sales.');
  }

  if (margin >= 15 && profit > 0) nextActions.push('Reinvest a portion of profit into marketing or inventory.');
  if (m.bestSellingProduct) nextActions.push(`Promote "${m.bestSellingProduct}" to accelerate revenue.`);
  nextActions.push('Send outstanding invoices promptly to improve cash flow.');

  return {
    title: 'AI Business Report',
    generatedAt: new Date().toISOString(),
    headline: `Health Score ${m.healthScore ?? 0}/100 — net ${profit >= 0 ? 'profit' : 'loss'} of ${money(
      Math.abs(profit),
      currency
    )} at a ${pct(margin)} margin.`,
    sections: {
      improved: improved.length ? improved : ['Not enough history yet — keep recording data.'],
      declined: declined.length ? declined : ['No notable declines detected.'],
      risks: risks.length ? risks : ['No major risks detected right now.'],
      nextActions,
    },
    mode: 'mock',
  };
}
