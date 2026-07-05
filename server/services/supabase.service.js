import { createClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from '../config/index.js';

let client = null;
if (isSupabaseConfigured) {
  client = createClient(config.supabaseUrl, config.supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export { isSupabaseConfigured };

/**
 * Fetch all business data for a given businessId from Supabase.
 * Returns null when Supabase is not configured or the business is not found,
 * so callers can gracefully fall back to client-provided context.
 */
export async function fetchBusinessData(businessId) {
  if (!client || !businessId) return null;

  const [business, sales, expenses, inventory, invoices, walletTransactions] = await Promise.all([
    client.from('businesses').select('*').eq('id', businessId).maybeSingle(),
    client.from('sales').select('*').eq('business_id', businessId),
    client.from('expenses').select('*').eq('business_id', businessId),
    client.from('inventory').select('*').eq('business_id', businessId),
    client.from('invoices').select('*').eq('business_id', businessId),
    client.from('wallet_transactions').select('*').eq('business_id', businessId),
  ]);

  if (business.error || !business.data) return null;

  return {
    business: business.data,
    sales: sales.data || [],
    expenses: expenses.data || [],
    inventory: inventory.data || [],
    invoices: invoices.data || [],
    walletTransactions: walletTransactions.data || [],
  };
}
