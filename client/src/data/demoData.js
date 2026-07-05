/**
 * Demo dataset for Mona360.
 * Seeds a realistic Zambian retail business so the app looks alive
 * immediately after sign-up / demo login.
 */

const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function dateAgo(n) {
  return daysAgo(n).slice(0, 10);
}

export const DEMO_BUSINESS = {
  id: 'biz_demo',
  business_name: 'BrightMart Supplies',
  owner_name: 'Newton Banda',
  business_type: 'Retail & General Trading',
  country: 'Zambia',
  city: 'Lusaka',
  currency: 'ZMW',
  wallet_address: '0x7A3f9C2b8E5d1A4f6B0c9D8e2F1a3B4c5D6e7F80',
  verification_status: 'verified',
  created_at: daysAgo(120),
};

export const DEMO_SALES = [
  { id: uid('sale'), product_name: 'Cooking Oil', customer_name: 'Grace Phiri', amount: 850, payment_method: 'Mobile Money', notes: 'Repeat customer', sale_date: dateAgo(1), created_at: daysAgo(1) },
  { id: uid('sale'), product_name: 'Rice', customer_name: 'Joseph Mwansa', amount: 1200, payment_method: 'Cash', notes: '', sale_date: dateAgo(2), created_at: daysAgo(2) },
  { id: uid('sale'), product_name: 'Sugar', customer_name: 'Mary Tembo', amount: 650, payment_method: 'Mobile Money', notes: '', sale_date: dateAgo(3), created_at: daysAgo(3) },
  { id: uid('sale'), product_name: 'Mealie Meal', customer_name: 'Peter Zulu', amount: 950, payment_method: 'Cash', notes: 'Bulk buyer', sale_date: dateAgo(4), created_at: daysAgo(4) },
  { id: uid('sale'), product_name: 'Soap', customer_name: 'Ruth Banda', amount: 400, payment_method: 'Card', notes: '', sale_date: dateAgo(5), created_at: daysAgo(5) },
  { id: uid('sale'), product_name: 'Rice', customer_name: 'Daniel Chanda', amount: 1200, payment_method: 'Mobile Money', notes: '', sale_date: dateAgo(7), created_at: daysAgo(7) },
  { id: uid('sale'), product_name: 'Cooking Oil', customer_name: 'Esther Mumba', amount: 850, payment_method: 'Cash', notes: '', sale_date: dateAgo(9), created_at: daysAgo(9) },
  { id: uid('sale'), product_name: 'Mealie Meal', customer_name: 'Alice Kunda', amount: 950, payment_method: 'Mobile Money', notes: '', sale_date: dateAgo(12), created_at: daysAgo(12) },
  { id: uid('sale'), product_name: 'Sugar', customer_name: 'John Sakala', amount: 650, payment_method: 'Cash', notes: '', sale_date: dateAgo(15), created_at: daysAgo(15) },
  { id: uid('sale'), product_name: 'Soft Drinks', customer_name: 'Faith Ngoma', amount: 500, payment_method: 'Mobile Money', notes: 'Party order', sale_date: dateAgo(18), created_at: daysAgo(18) },
];

export const DEMO_EXPENSES = [
  { id: uid('exp'), title: 'Shop Rent', category: 'Rent', amount: 2500, notes: 'Monthly', expense_date: dateAgo(2), created_at: daysAgo(2) },
  { id: uid('exp'), title: 'Delivery Transport', category: 'Transport', amount: 600, notes: '', expense_date: dateAgo(3), created_at: daysAgo(3) },
  { id: uid('exp'), title: 'Electricity (ZESCO)', category: 'Utilities', amount: 450, notes: '', expense_date: dateAgo(4), created_at: daysAgo(4) },
  { id: uid('exp'), title: 'Stock Purchase', category: 'Inventory', amount: 3000, notes: 'Wholesale restock', expense_date: dateAgo(6), created_at: daysAgo(6) },
  { id: uid('exp'), title: 'Social Media Ads', category: 'Marketing', amount: 300, notes: '', expense_date: dateAgo(8), created_at: daysAgo(8) },
];

export const DEMO_INVENTORY = [
  { id: uid('inv'), product_name: 'Cooking Oil', category: 'Groceries', quantity: 14, buying_price: 620, selling_price: 850, reorder_level: 10, created_at: daysAgo(30) },
  { id: uid('inv'), product_name: 'Rice', category: 'Groceries', quantity: 8, buying_price: 900, selling_price: 1200, reorder_level: 12, created_at: daysAgo(30) },
  { id: uid('inv'), product_name: 'Sugar', category: 'Groceries', quantity: 22, buying_price: 470, selling_price: 650, reorder_level: 10, created_at: daysAgo(30) },
  { id: uid('inv'), product_name: 'Mealie Meal', category: 'Staples', quantity: 6, buying_price: 720, selling_price: 950, reorder_level: 15, created_at: daysAgo(30) },
  { id: uid('inv'), product_name: 'Soap', category: 'Household', quantity: 40, buying_price: 250, selling_price: 400, reorder_level: 12, created_at: daysAgo(30) },
  { id: uid('inv'), product_name: 'Soft Drinks', category: 'Beverages', quantity: 3, buying_price: 320, selling_price: 500, reorder_level: 18, created_at: daysAgo(30) },
];

export const DEMO_INVOICES = [
  { id: uid('inv'), invoice_number: 'INV-1001', customer_name: 'Lusaka Grocers Ltd', customer_contact: 'accounts@lusakagrocers.zm', item_description: 'Bulk Cooking Oil (20 units)', quantity: 20, unit_price: 820, total_amount: 16400, status: 'paid', due_date: dateAgo(-5), invoice_hash: '0xINV-A1B2C3D4E5F6A7B8C9D0', created_at: daysAgo(10) },
  { id: uid('inv'), invoice_number: 'INV-1002', customer_name: 'Kabwata Restaurant', customer_contact: '+260 97 123 4567', item_description: 'Rice + Mealie Meal supply', quantity: 30, unit_price: 1050, total_amount: 31500, status: 'pending', due_date: dateAgo(-3), invoice_hash: '0xINV-F1E2D3C4B5A6978869AB', created_at: daysAgo(4) },
  { id: uid('inv'), invoice_number: 'INV-1003', customer_name: 'Chilenje Mini Mart', customer_contact: 'chilenje.mart@mail.zm', item_description: 'Sugar (15) + Soap (25)', quantity: 40, unit_price: 500, total_amount: 20000, status: 'overdue', due_date: dateAgo(6), invoice_hash: '0xINV-99AA88BB77CC66DD55EE', created_at: daysAgo(20) },
];

export const DEMO_WALLET_TX = [
  { id: uid('wtx'), transaction_type: 'received', amount: 16400, currency: 'ZMW', wallet_address: '0x7A3f...7F80', transaction_hash: '0xPAY-7c9a2f4b1e8d6a3c', status: 'confirmed', created_at: daysAgo(9) },
  { id: uid('wtx'), transaction_type: 'sent', amount: 3000, currency: 'ZMW', wallet_address: '0x9B2c...11Aa', transaction_hash: '0xPAY-11de77aa22bb33cc', status: 'confirmed', created_at: daysAgo(6) },
  { id: uid('wtx'), transaction_type: 'received', amount: 950, currency: 'ZMW', wallet_address: '0x4D8e...09Cd', transaction_hash: '0xPAY-4409cd88ff00aa12', status: 'confirmed', created_at: daysAgo(4) },
  { id: uid('wtx'), transaction_type: 'received', amount: 500, currency: 'ZMW', wallet_address: '0x2F1a...B4c5', transaction_hash: '0xPAY-2f1ab4c5d6e70819', status: 'pending', created_at: daysAgo(1) },
];

export function buildDemoState() {
  return {
    business: { ...DEMO_BUSINESS },
    sales: DEMO_SALES.map((s) => ({ ...s })),
    expenses: DEMO_EXPENSES.map((e) => ({ ...e })),
    inventory: DEMO_INVENTORY.map((i) => ({ ...i })),
    invoices: DEMO_INVOICES.map((i) => ({ ...i })),
    walletTransactions: DEMO_WALLET_TX.map((t) => ({ ...t })),
  };
}
