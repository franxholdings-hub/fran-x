-- ============================================================
-- FRAN-X AI INTEGRATION + CENTRALIZED REVENUE SYSTEM
-- Foundation schema. Extends the existing FRAN-X platform.
-- All management tables are admin-only (RLS). The public can only
-- read active AI packages (for the pricing page). The embeddable
-- widget talks to a server route that uses the service-role client
-- (bypasses RLS) so no client secrets ever reach the browser.
-- ============================================================

-- ------------------------------------------------------------
-- 1. AI CLIENTS (multi-tenant). Tenant isolation is enforced by
--    client_id on every child table + RLS scoping on the admin side.
-- ------------------------------------------------------------
create sequence public.ai_client_seq start 1;

create or replace function public.next_ai_client_code()
returns text language sql security definer set search_path = public as $$
  select 'FRANX-CLIENT-' || lpad(nextval('public.ai_client_seq')::text, 6, '0');
$$;
revoke execute on function public.next_ai_client_code() from anon, authenticated, public;

create table public.ai_clients (
  id uuid primary key default gen_random_uuid(),
  client_code text not null unique default public.next_ai_client_code(),
  business_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  country text,
  website text,
  industry text,
  status text not null default 'pending',          -- pending | active | suspended
  branding jsonb not null default '{}'::jsonb,     -- {ai_name, welcome_message, suggested_questions[], primary_color, avatar_url, whatsapp_number}
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.ai_clients to authenticated;
grant all on public.ai_clients to service_role;
alter table public.ai_clients enable row level security;
create policy "ai_clients admin all" on public.ai_clients for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- 1:1 configuration / model / usage limits per client
create table public.ai_client_config (
  client_id uuid primary key references public.ai_clients(id) on delete cascade,
  provider text not null default 'lovable',        -- openai | gemini | claude | groq | lovable
  model text not null default 'openai/gpt-5.6-terra',
  fallback_model text,
  system_prompt text not null default '',
  personality text not null default 'Professional, helpful and on-brand.',
  temperature numeric not null default 0.4,
  usage_limit_monthly int not null default 1000,   -- max messages per month
  token_limit_per_request int not null default 4000,
  rate_limit_per_hour int not null default 100,
  is_approved boolean not null default false,      -- admin must approve before widget works
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.ai_client_config to authenticated;
grant all on public.ai_client_config to service_role;
alter table public.ai_client_config enable row level security;
create policy "ai_client_config admin all" on public.ai_client_config for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Knowledge base per client (FAQs, products, services, pricing, documents)
create table public.ai_client_knowledge (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.ai_clients(id) on delete cascade,
  type text not null default 'general',            -- faq | product | service | pricing | document | general
  title text not null,
  content text not null,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ai_client_knowledge_client_idx on public.ai_client_knowledge(client_id);
grant select, insert, update, delete on public.ai_client_knowledge to authenticated;
grant all on public.ai_client_knowledge to service_role;
alter table public.ai_client_knowledge enable row level security;
create policy "ai_client_knowledge admin all" on public.ai_client_knowledge for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Tenant-isolated conversations for client widgets
create table public.ai_client_conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.ai_clients(id) on delete cascade,
  visitor_id text,
  status text not null default 'active',           -- active | escalated | closed
  lead_score int,
  classification text,
  contact_name text,
  contact_email text,
  contact_phone text,
  contact_country text,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  message_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ai_client_conv_client_idx on public.ai_client_conversations(client_id, created_at);
grant select, insert, update, delete on public.ai_client_conversations to authenticated;
grant all on public.ai_client_conversations to service_role;
alter table public.ai_client_conversations enable row level security;
create policy "ai_client_conv admin all" on public.ai_client_conversations for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.ai_client_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_client_conversations(id) on delete cascade,
  role text not null,                              -- user | assistant | system
  content text not null,
  tokens int,
  created_at timestamptz not null default now()
);
create index ai_client_msg_conv_idx on public.ai_client_messages(conversation_id, created_at);
grant select, insert, update, delete on public.ai_client_messages to authenticated;
grant all on public.ai_client_messages to service_role;
alter table public.ai_client_messages enable row level security;
create policy "ai_client_msg admin all" on public.ai_client_messages for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Per-client usage tracking (one row per client per month)
create table public.ai_client_usage (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.ai_clients(id) on delete cascade,
  period_month text not null,                       -- YYYY-MM
  messages int not null default 0,
  ai_requests int not null default 0,
  tokens int not null default 0,
  estimated_cost numeric not null default 0,
  unique (client_id, period_month)
);
grant select, insert, update, delete on public.ai_client_usage to authenticated;
grant all on public.ai_client_usage to service_role;
alter table public.ai_client_usage enable row level security;
create policy "ai_client_usage admin all" on public.ai_client_usage for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Link AI client leads into the EXISTING CRM (inquiries), not a duplicate.
alter table public.inquiries add column if not exists ai_client_id uuid references public.ai_clients(id) on delete set null;
create index if not exists inquiries_ai_client_idx on public.inquiries(ai_client_id);

-- ------------------------------------------------------------
-- 2. AI PACKAGES (billing). Public can read active packages.
-- ------------------------------------------------------------
create table public.ai_packages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                        -- starter | professional | enterprise
  name text not null,
  setup_fee numeric not null default 0,
  monthly_price numeric not null default 0,
  currency text not null default 'NGN',
  usage_limit int not null default 1000,
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);
grant select on public.ai_packages to anon, authenticated;
grant insert, update, delete on public.ai_packages to authenticated;
grant all on public.ai_packages to service_role;
alter table public.ai_packages enable row level security;
create policy "ai_packages public read" on public.ai_packages for select to anon, authenticated
  using (is_active or public.has_role(auth.uid(),'admin'));
create policy "ai_packages admin write" on public.ai_packages for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.ai_packages (code, name, setup_fee, monthly_price, currency, usage_limit, features, sort_order) values
  ('starter', 'AI Starter', 150000, 30000, 'NGN', 1000,
    '["1 AI assistant","Knowledge base (up to 50 items)","Website widget","Lead capture","Email support"]', 1),
  ('professional', 'AI Professional', 300000, 75000, 'NGN', 5000,
    '["Everything in Starter","Knowledge base (up to 250 items)","Human handoff","WhatsApp integration","Usage analytics","Priority support"]', 2),
  ('enterprise', 'AI Enterprise', 0, 0, 'NGN', 0,
    '["Custom AI assistant","Unlimited knowledge base","Multi-provider support","Custom integrations","Dedicated manager","SLA"]', 3)
  on conflict (code) do nothing;

-- Client subscriptions (Paystack-backed)
create table public.ai_client_subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.ai_clients(id) on delete cascade,
  package_id uuid references public.ai_packages(id) on delete set null,
  status text not null default 'trial',             -- trial | active | past_due | cancelled
  started_at timestamptz not null default now(),
  current_period_end date,
  paystack_subscription_code text,
  paystack_plan_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ai_client_sub_client_idx on public.ai_client_subscriptions(client_id);
grant select, insert, update, delete on public.ai_client_subscriptions to authenticated;
grant all on public.ai_client_subscriptions to service_role;
alter table public.ai_client_subscriptions enable row level security;
create policy "ai_client_sub admin all" on public.ai_client_subscriptions for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ------------------------------------------------------------
-- 3. UNIFIED CUSTOMERS (one record across all FRAN-X services)
-- ------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  country text,
  type text not null default 'individual',          -- individual | business
  user_id uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_email_idx on public.customers(lower(email));
grant select, insert, update, delete on public.customers to authenticated;
grant all on public.customers to service_role;
alter table public.customers enable row level security;
create policy "customers admin all" on public.customers for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ------------------------------------------------------------
-- 4. CENTRALIZED REVENUE HISTORY — the ONE permanent revenue system.
--    No DELETE policy: historical financial records are never deleted.
--    category is free text so future FRAN-X products can be added freely.
-- ------------------------------------------------------------
create table public.revenue_history (
  id uuid primary key default gen_random_uuid(),
  transaction_id text not null unique,
  transacted_at date not null default current_date,
  customer_name text,
  customer_email text,
  customer_id uuid references public.customers(id) on delete set null,
  category text not null default 'Other',           -- Subscriptions | AI Integration | Website Development | ... | Other
  service_product text,
  amount numeric not null default 0,
  currency text not null default 'NGN',
  payment_method text,                               -- paystack | bank_transfer | cash | card | other
  paystack_reference text,
  payment_status text not null default 'completed',  -- pending | completed | failed | refunded
  related_type text,                                 -- inquiry | project | ai_client | subscription | service
  related_id text,
  notes text,
  created_at timestamptz not null default now()
);
create index revenue_history_date_idx on public.revenue_history(transacted_at desc);
create index revenue_history_category_idx on public.revenue_history(category);
grant select, insert, update on public.revenue_history to authenticated;
grant all on public.revenue_history to service_role;
alter table public.revenue_history enable row level security;
create policy "revenue admin read" on public.revenue_history for select to authenticated
  using (public.has_role(auth.uid(),'admin'));
create policy "revenue admin insert" on public.revenue_history for insert to authenticated
  with check (public.has_role(auth.uid(),'admin'));
create policy "revenue admin update" on public.revenue_history for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
-- NOTE: no DELETE policy — historical financial records are never deleted.

-- ------------------------------------------------------------
-- 5. EXPENSES (cost / profit foundation)
-- ------------------------------------------------------------
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  incurred_at date not null default current_date,
  category text not null default 'Operations',      -- AI/API | Hosting | Software | Marketing | Operations | Logistics | Other
  description text not null,
  amount numeric not null default 0,
  currency text not null default 'NGN',
  vendor text,
  related_client_id uuid references public.ai_clients(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);
create index expenses_date_idx on public.expenses(incurred_at desc);
grant select, insert, update, delete on public.expenses to authenticated;
grant all on public.expenses to service_role;
alter table public.expenses enable row level security;
create policy "expenses admin all" on public.expenses for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- updated_at triggers for new tables
create or replace function public.set_updated_at_col()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
revoke execute on function public.set_updated_at_col() from anon, authenticated, public;

do $$
declare t text;
begin
  foreach t in array array['ai_clients','ai_client_config','ai_client_knowledge','ai_client_conversations','ai_packages','ai_client_subscriptions','customers','expenses']
  loop
    execute format('drop trigger if exists %I_updated_at on public.%I;', t, t);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at_col();', t, t);
  end loop;
end $$;
