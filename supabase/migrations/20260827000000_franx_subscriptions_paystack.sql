-- ============================================================
-- FRAN-X SUBSCRIPTIONS + PAYSTACK + CENTRALIZED PAYMENTS
-- EXTENDS the existing ai_packages (plans) + revenue_history.
-- Does NOT duplicate customers or revenue_history.
--   - ai_packages  -> extended into the ONE plans table (platform + AI)
--   - subscriptions -> platform-member subscriptions (lifecycle + Paystack)
--   - payments     -> centralized payment records with verification
--   - revenue_history (existing) -> fed by verified successful payments
-- ============================================================

-- ------------------------------------------------------------
-- 1. EXTEND ai_packages into the unified subscription-plans table
-- ------------------------------------------------------------
alter table public.ai_packages add column if not exists billing_interval text not null default 'monthly';
-- monthly | yearly | one_time | free
alter table public.ai_packages add column if not exists trial_days int not null default 0;
alter table public.ai_packages add column if not exists description text not null default '';
alter table public.ai_packages add column if not exists product_type text not null default 'platform';
-- platform | ai_integration
alter table public.ai_packages add column if not exists paystack_plan_code text;

-- The seeded AI packages are AI-integration products
update public.ai_packages
  set product_type = 'ai_integration'
  where code in ('starter','professional','enterprise') and product_type = 'platform';

-- FRAN-X EXPLORER — free, 7-day trial
insert into public.ai_packages
  (code, name, setup_fee, monthly_price, currency, usage_limit, features, is_active, sort_order,
   billing_interval, trial_days, description, product_type)
values
  ('explorer', 'FRAN-X Explorer', 0, 0, 'NGN', 20,
   '["Browse FRAN-X services","Browse approved business opportunities","Basic FRIX AI conversations (up to 20)","Basic business information","Basic AI recommendations","Submit basic inquiries","One basic business assessment"]',
   true, 0, 'free', 7,
   'Free 7-day trial. Experience FRAN-X before subscribing. After the trial, public/free areas remain accessible; premium features require a paid plan.',
   'platform')
on conflict (code) do nothing;

-- ------------------------------------------------------------
-- 2. SUBSCRIPTIONS (platform members). Lifecycle + Paystack links.
--    Distinct from ai_client_subscriptions (B2B AI-widget clients);
--    both reference the unified ai_packages.
-- ------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.ai_packages(id) on delete set null,
  status text not null default 'trial',            -- trial | active | past_due | cancelled | expired | suspended
  started_at timestamptz not null default now(),
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  paystack_subscription_code text,
  paystack_plan_code text,
  paystack_customer_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);
grant select, insert, update, delete on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;
drop policy if exists "subscriptions owner read" on public.subscriptions;
create policy "subscriptions owner read" on public.subscriptions
  for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
drop policy if exists "subscriptions admin write" on public.subscriptions;
create policy "subscriptions admin write" on public.subscriptions
  for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ------------------------------------------------------------
-- 3. PAYMENTS — centralized, verification-gated
-- ------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  transaction_id text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  plan_id uuid references public.ai_packages(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  service_product text,
  amount numeric not null default 0,
  currency text not null default 'NGN',
  payment_method text default 'paystack',
  paystack_reference text unique,
  payment_status text not null default 'pending',  -- pending | successful | failed | abandoned | refunded
  verification_status text not null default 'unverified', -- unverified | verified
  verification_source text,                          -- api | webhook | manual
  related_type text,                                 -- subscription | service | ai_integration | one_time
  related_id text,
  paystack_response jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  notes text
);
create index if not exists payments_user_idx on public.payments(user_id);
create index if not exists payments_status_idx on public.payments(payment_status);
create index if not exists payments_ref_idx on public.payments(paystack_reference);
grant select, insert, update on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
drop policy if exists "payments owner read" on public.payments;
create policy "payments owner read" on public.payments
  for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
drop policy if exists "payments admin write" on public.payments;
create policy "payments admin write" on public.payments
  for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ------------------------------------------------------------
-- 4. Link subscriptions -> revenue (existing) for reporting
-- ------------------------------------------------------------
alter table public.revenue_history add column if not exists subscription_id uuid references public.subscriptions(id) on delete set null;
alter table public.revenue_history add column if not exists payment_id uuid references public.payments(id) on delete set null;
alter table public.revenue_history add column if not exists verification_status text;

-- updated_at trigger for subscriptions
drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at_col();
