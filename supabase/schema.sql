-- =============================================================================
-- BusinessBrain AI — Supabase schema
-- =============================================================================
-- Run this in the Supabase SQL editor to enable cloud persistence + auth.
-- The frontend also works fully WITHOUT this (local demo mode) — this schema
-- is for when you wire real Supabase credentials into the client .env.
--
-- Row Level Security is enabled so each authenticated user only ever sees
-- rows belonging to their own business.
-- =============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- users  (mirrors auth.users; a public profile row per account)
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- businesses
-- -----------------------------------------------------------------------------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_name text not null,
  owner_name text,
  business_type text,
  country text,
  city text,
  currency text not null default 'ZMW',
  wallet_address text,
  verification_status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists idx_businesses_user on public.businesses (user_id);

-- -----------------------------------------------------------------------------
-- sales
-- -----------------------------------------------------------------------------
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  product_name text not null,
  customer_name text,
  amount numeric(14,2) not null default 0,
  payment_method text,
  notes text,
  sale_date date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists idx_sales_business on public.sales (business_id);

-- -----------------------------------------------------------------------------
-- expenses
-- -----------------------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  title text not null,
  category text,
  amount numeric(14,2) not null default 0,
  notes text,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists idx_expenses_business on public.expenses (business_id);

-- -----------------------------------------------------------------------------
-- inventory
-- -----------------------------------------------------------------------------
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  product_name text not null,
  category text,
  quantity integer not null default 0,
  buying_price numeric(14,2) not null default 0,
  selling_price numeric(14,2) not null default 0,
  reorder_level integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_inventory_business on public.inventory (business_id);

-- -----------------------------------------------------------------------------
-- invoices
-- -----------------------------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  invoice_number text not null,
  customer_name text not null,
  customer_contact text,
  item_description text,
  quantity integer not null default 1,
  unit_price numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  status text not null default 'pending',
  due_date date,
  invoice_hash text,
  created_at timestamptz not null default now()
);
create index if not exists idx_invoices_business on public.invoices (business_id);

-- -----------------------------------------------------------------------------
-- wallet_transactions
-- -----------------------------------------------------------------------------
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  transaction_type text not null,           -- 'received' | 'sent'
  amount numeric(14,2) not null default 0,
  currency text not null default 'ZMW',
  wallet_address text,
  transaction_hash text,
  status text not null default 'confirmed',  -- 'confirmed' | 'pending'
  created_at timestamptz not null default now()
);
create index if not exists idx_wallet_tx_business on public.wallet_transactions (business_id);

-- -----------------------------------------------------------------------------
-- ai_insights
-- -----------------------------------------------------------------------------
create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  insight_type text,
  title text,
  message text,
  priority text default 'low',               -- 'high' | 'medium' | 'low'
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_insights_business on public.ai_insights (business_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.users enable row level security;
alter table public.businesses enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;
alter table public.inventory enable row level security;
alter table public.invoices enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.ai_insights enable row level security;

-- users: a user can read/update only their own profile row
drop policy if exists "users self access" on public.users;
create policy "users self access" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- businesses: owner-only access
drop policy if exists "businesses owner access" on public.businesses;
create policy "businesses owner access" on public.businesses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Helper: a reusable policy pattern for business-scoped child tables.
-- (Applied individually below because Postgres policies can't be templated.)

drop policy if exists "sales owner access" on public.sales;
create policy "sales owner access" on public.sales
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid())
  );

drop policy if exists "expenses owner access" on public.expenses;
create policy "expenses owner access" on public.expenses
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid())
  );

drop policy if exists "inventory owner access" on public.inventory;
create policy "inventory owner access" on public.inventory
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid())
  );

drop policy if exists "invoices owner access" on public.invoices;
create policy "invoices owner access" on public.invoices
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid())
  );

drop policy if exists "wallet_tx owner access" on public.wallet_transactions;
create policy "wallet_tx owner access" on public.wallet_transactions
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid())
  );

drop policy if exists "ai_insights owner access" on public.ai_insights;
create policy "ai_insights owner access" on public.ai_insights
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.user_id = auth.uid())
  );

-- =============================================================================
-- Auto-create a public.users row when a new auth user signs up
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
