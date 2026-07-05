import { fetchBusinessData, isSupabaseConfigured } from './supabase.service.js';
import { computeMetricsFromData, normalizeContext, healthLabel } from './metrics.service.js';
import { askGemini, isGeminiConfigured } from './gemini.service.js';

function money(amount, currency = 'ZMW') {
  const symbols = { ZMW: 'K', USD: '$', EUR: '€', GBP: '£', NGN: '₦', KES: 'KSh', ZAR: 'R' };
  const symbol = symbols[currency] || `${currency} `;
  return `${symbol}${Number(amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function riskLevel(m) {
  if (m.netProfit < 0 || m.healthScore < 50) return 'High';
  if (m.healthScore < 70 || m.lowStockProducts.length > 0 || m.unpaidInvoicesCount > 0) return 'Medium';
  return 'Low';
}

/** Human-readable summary block sent to Gemini as context. */
export function buildBusinessSummary(m) {
  const c = m.currency;
  const lines = [
    `Business Name: ${m.businessName}`,
    `Currency: ${c}`,
    `Total Revenue: ${money(m.totalRevenue, c)}`,
    `Total Expenses: ${money(m.totalExpenses, c)}`,
    `Net Profit: ${money(m.netProfit, c)}`,
    `Profit Margin: ${m.profitMargin.toFixed(1)}%`,
    `Cash Flow: ${m.cashFlowStatus}`,
    `Best-Selling Product: ${m.bestSellingProduct || 'none recorded yet'}`,
    `Highest Expense Category: ${m.highestExpenseCategory || 'none recorded yet'}`,
    `Low Stock Items: ${m.lowStockProducts.length ? m.lowStockProducts.join(', ') : 'none'}`,
    `Dead Stock (no recent sales): ${m.deadStockProducts.length ? m.deadStockProducts.join(', ') : 'none'}`,
    `Invoices Issued: ${m.invoicesIssued} (Paid: ${m.paidInvoices}, Unpaid: ${m.unpaidInvoicesCount} worth ${money(m.unpaidInvoicesTotal, c)})`,
    `Wallet Balance: ${money(m.walletBalance, c)}`,
    `Sales recorded: ${m.salesCount}, Expenses recorded: ${m.expenseCount}, Inventory items: ${m.inventoryCount}`,
    `Business Health Score: ${m.healthScore}/100 (${healthLabel(m.healthScore)})`,
    `Business Trust Score: ${m.trustScore}/100`,
  ];
  return lines.join('\n');
}

const INTENTS = [
  { key: 'restock', patterns: ['restock', 'afford to restock', 'buy stock', 'reorder', 'can i afford'] },
  { key: 'expenses', patterns: ['expense', 'too high', 'cost', 'spending', 'reduce cost'] },
  { key: 'products', patterns: ['product', 'need attention', 'which products', 'inventory', 'stock'] },
  { key: 'profit', patterns: ['profit', 'increase profit', 'make more', 'margin', 'earn more'] },
  { key: 'risk', patterns: ['risk', 'biggest risk', 'danger', 'worried', 'problem'] },
  { key: 'improve', patterns: ['improve', 'this week', 'grow', 'better', 'what should i'] },
  { key: 'summary', patterns: ['summarize', 'summary', 'today', 'overview', 'how is my business', 'how am i doing', 'doing'] },
];

function detectIntent(message = '') {
  const t = message.toLowerCase();
  for (const intent of INTENTS) if (intent.patterns.some((p) => t.includes(p))) return intent.key;
  return 'summary';
}

/**
 * Dynamic, data-driven fallback advisor. Produces a structured response that
 * changes with both the question intent and the actual business numbers.
 */
export function buildFallbackResponse(m, message) {
  const c = m.currency;
  const intent = detectIntent(message);
  const risk = riskLevel(m);
  const loss = m.netProfit < 0;

  const findings = [
    `Revenue: ${money(m.totalRevenue, c)}`,
    `Expenses: ${money(m.totalExpenses, c)}`,
    `Net ${loss ? 'loss' : 'profit'}: ${money(Math.abs(m.netProfit), c)} (${m.profitMargin.toFixed(1)}% margin)`,
    `Health score: ${m.healthScore}/100 (${healthLabel(m.healthScore)})`,
  ];
  if (m.lowStockProducts.length) findings.push(`Low stock: ${m.lowStockProducts.join(', ')}`);
  if (m.unpaidInvoicesCount) findings.push(`Unpaid invoices: ${m.unpaidInvoicesCount} worth ${money(m.unpaidInvoicesTotal, c)}`);
  if (m.bestSellingProduct) findings.push(`Best seller: ${m.bestSellingProduct}`);

  let summary;
  const actions = [];

  switch (intent) {
    case 'restock': {
      const canAfford = m.walletBalance > 0 && m.netProfit >= 0;
      summary = canAfford
        ? `You have room to restock carefully. Your wallet balance is ${money(m.walletBalance, c)} and you are ${loss ? 'at a loss' : 'profitable'}, so restock only fast-moving items first.`
        : `Restocking is risky right now. ${loss ? `You are operating at a loss of ${money(Math.abs(m.netProfit), c)}.` : ''} Prioritise cash before buying more stock.`;
      if (m.lowStockProducts.length) actions.push(`Restock priority items first: ${m.lowStockProducts.slice(0, 3).join(', ')}.`);
      if (m.bestSellingProduct) actions.push(`Keep "${m.bestSellingProduct}" in stock — it drives the most revenue.`);
      if (m.unpaidInvoicesCount) actions.push(`Collect ${money(m.unpaidInvoicesTotal, c)} in unpaid invoices to fund restocking.`);
      actions.push('Avoid restocking dead stock that is not selling.');
      break;
    }
    case 'expenses': {
      const ratio = m.totalRevenue ? (m.totalExpenses / m.totalRevenue) * 100 : 0;
      summary = `Your expenses are ${money(m.totalExpenses, c)} — about ${ratio.toFixed(0)}% of revenue. ${
        m.totalExpenses > m.totalRevenue ? 'That is unsustainable and must be reduced now.' : 'That is workable, but watch your biggest category.'
      }`;
      if (m.highestExpenseCategory) actions.push(`Review "${m.highestExpenseCategory}" — your largest cost category.`);
      actions.push('Cut or pause non-essential spending this week.');
      actions.push('Renegotiate recurring costs (rent, transport, utilities) where possible.');
      break;
    }
    case 'products': {
      summary = m.lowStockProducts.length || m.deadStockProducts.length
        ? `Some products need attention. ${m.lowStockProducts.length ? `${m.lowStockProducts.length} are low on stock.` : ''} ${m.deadStockProducts.length ? `${m.deadStockProducts.length} are not selling.` : ''}`
        : `Your product mix looks healthy — nothing is below reorder level and your best seller is ${m.bestSellingProduct || 'not yet identified'}.`;
      if (m.lowStockProducts.length) actions.push(`Restock soon: ${m.lowStockProducts.slice(0, 4).join(', ')}.`);
      if (m.deadStockProducts.length) actions.push(`Promote or discount slow movers: ${m.deadStockProducts.slice(0, 3).join(', ')}.`);
      if (m.bestSellingProduct) actions.push(`Feature "${m.bestSellingProduct}" prominently to grow sales.`);
      break;
    }
    case 'profit': {
      summary = loss
        ? `You are currently at a loss of ${money(Math.abs(m.netProfit), c)}. The fastest path to profit is cutting costs and pushing your best seller.`
        : `Your net profit is ${money(m.netProfit, c)} at a ${m.profitMargin.toFixed(1)}% margin. To grow it, lift revenue while holding costs steady.`;
      if (m.bestSellingProduct) actions.push(`Sell more of "${m.bestSellingProduct}" — bundle it or offer a small loyalty discount.`);
      if (m.highestExpenseCategory) actions.push(`Trim "${m.highestExpenseCategory}" to widen your margin.`);
      if (m.unpaidInvoicesCount) actions.push(`Collect ${money(m.unpaidInvoicesTotal, c)} in unpaid invoices to boost cash.`);
      actions.push('Focus marketing on repeat customers — they are cheaper to sell to.');
      break;
    }
    case 'risk': {
      const risks = [];
      if (loss) risks.push(`operating at a loss of ${money(Math.abs(m.netProfit), c)}`);
      if (m.totalExpenses > m.totalRevenue) risks.push('expenses exceeding revenue');
      if (m.lowStockProducts.length) risks.push(`${m.lowStockProducts.length} low-stock item(s) risking lost sales`);
      if (m.unpaidInvoicesCount) risks.push(`${money(m.unpaidInvoicesTotal, c)} tied up in unpaid invoices`);
      summary = risks.length
        ? `Your biggest risk right now is ${risks[0]}. ${risks.length > 1 ? `Watch also: ${risks.slice(1).join(', ')}.` : ''}`
        : `No major risks detected. Your health score is ${m.healthScore}/100 and cash flow is ${m.cashFlowStatus.toLowerCase()}.`;
      if (m.unpaidInvoicesCount) actions.push('Follow up on unpaid invoices to protect cash flow.');
      if (m.totalExpenses > m.totalRevenue) actions.push('Reduce non-essential expenses immediately.');
      if (m.lowStockProducts.length) actions.push(`Restock ${m.lowStockProducts.slice(0, 3).join(', ')} before you lose sales.`);
      if (!actions.length) actions.push('Keep monitoring your health score and best-seller stock levels.');
      break;
    }
    case 'improve': {
      summary = `This week, focus on the highest-impact moves for ${m.businessName}. Your health score is ${m.healthScore}/100.`;
      if (m.totalExpenses > m.totalRevenue) actions.push(`Cut costs — expenses (${money(m.totalExpenses, c)}) are above revenue (${money(m.totalRevenue, c)}).`);
      if (m.unpaidInvoicesCount) actions.push(`Chase ${m.unpaidInvoicesCount} unpaid invoice(s) worth ${money(m.unpaidInvoicesTotal, c)}.`);
      if (m.lowStockProducts.length) actions.push(`Restock ${m.lowStockProducts.slice(0, 3).join(', ')}.`);
      if (m.bestSellingProduct) actions.push(`Promote your best seller, "${m.bestSellingProduct}".`);
      if (!actions.length) actions.push('Reinvest a small part of profit into marketing to keep momentum.');
      break;
    }
    case 'summary':
    default: {
      summary = loss
        ? `Your business currently needs attention. Expenses are higher than revenue, so you are operating at a loss of ${money(Math.abs(m.netProfit), c)}. Your health score is ${m.healthScore}/100 (${healthLabel(m.healthScore)}).`
        : `${m.businessName} is doing ${healthLabel(m.healthScore).toLowerCase()}. You are profitable with a net profit of ${money(m.netProfit, c)} at a ${m.profitMargin.toFixed(1)}% margin, and a health score of ${m.healthScore}/100.`;
      if (m.unpaidInvoicesCount) actions.push('Follow up on unpaid invoices to improve cash flow.');
      if (m.totalExpenses > m.totalRevenue) actions.push('Reduce non-essential expenses this week.');
      if (m.lowStockProducts.length) actions.push(`Restock fast-moving products: ${m.lowStockProducts.slice(0, 3).join(', ')}.`);
      if (loss) actions.push('Avoid adding new costs until revenue improves.');
      else actions.push('Reinvest part of your profit into marketing or inventory — carefully.');
      break;
    }
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

  return { reply, riskLevel: risk, intent };
}

/**
 * Main entry: resolve business metrics (Supabase or client context), then
 * answer via Gemini, falling back to the dynamic rule-based advisor.
 */
export async function getAdvisorResponse({ businessId, message, context }) {
  // 1) Resolve metrics — prefer live Supabase data, else client context.
  let metrics = null;
  let source = 'client-context';
  if (isSupabaseConfigured && businessId) {
    try {
      const data = await fetchBusinessData(businessId);
      if (data) {
        metrics = computeMetricsFromData(data);
        source = 'supabase';
      }
    } catch {
      /* fall through to client context */
    }
  }
  if (!metrics) metrics = normalizeContext(context || {});

  const businessSummary = buildBusinessSummary(metrics);
  const risk = riskLevel(metrics);

  // 2) Try Gemini for a smart, dynamic answer.
  if (isGeminiConfigured) {
    try {
      const reply = await askGemini({ businessSummary, message });
      return { reply, riskLevel: risk, mode: 'gemini', source, metrics };
    } catch (err) {
      // Gemini failed — fall back but tell the caller.
      const fallback = buildFallbackResponse(metrics, message);
      return { ...fallback, mode: 'fallback', source, error: err.message, metrics };
    }
  }

  // 3) No key → rule-based fallback.
  const fallback = buildFallbackResponse(metrics, message);
  return { ...fallback, mode: 'fallback', source, metrics };
}
