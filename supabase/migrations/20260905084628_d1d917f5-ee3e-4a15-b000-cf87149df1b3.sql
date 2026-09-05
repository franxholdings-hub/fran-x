-- ============================================================
-- FRAN-X DIGITAL STORE — products, services, subscriptions,
-- digital library, promotions and analytics.
-- ============================================================

create table if not exists public.digital_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  price numeric not null default 0,
  currency text not null default 'NGN',
  description text not null default '',
  whats_included jsonb not null default '[]'::jsonb,
  file_format text not null default '',
  cover text,
  featured boolean not null default false,
  is_bundle boolean not null default false,
  bundle_slugs jsonb not null default '[]'::jsonb,
  related_slugs jsonb not null default '[]'::jsonb,
  has_file boolean not null default false,
  file_url text,
  is_published boolean not null default false,
  is_archived boolean not null default false,
  sort_order int not null default 0,
  downloads int not null default 0,
  sales_count int not null default 0,
  revenue numeric not null default 0,
  disclaimer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists digital_products_category_idx on public.digital_products(category);
create index if not exists digital_products_published_idx on public.digital_products(is_published) where is_published = true;
grant select on public.digital_products to anon, authenticated;
grant all on public.digital_products to service_role;
alter table public.digital_products enable row level security;
drop policy if exists "digital_products public read" on public.digital_products;
create policy "digital_products public read" on public.digital_products
  for select to anon, authenticated
  using (is_published and not is_archived or public.has_role(auth.uid(),'admin'));
drop policy if exists "digital_products admin write" on public.digital_products;
create policy "digital_products admin write" on public.digital_products
  for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table if not exists public.digital_services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  group_label text not null,
  service_group text not null,
  price_from numeric not null default 0,
  billing_type text not null default 'one_time',
  billing_label text not null default 'From',
  description text not null default '',
  whats_included jsonb not null default '[]'::jsonb,
  delivery_estimate text not null default '',
  cover text,
  featured boolean not null default false,
  custom_quote_only boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  requests_count int not null default 0,
  revenue numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists digital_services_group_idx on public.digital_services(service_group);
create index if not exists digital_services_active_idx on public.digital_services(is_active) where is_active = true;
grant select on public.digital_services to anon, authenticated;
grant all on public.digital_services to service_role;
alter table public.digital_services enable row level security;
drop policy if exists "digital_services public read" on public.digital_services;
create policy "digital_services public read" on public.digital_services
  for select to anon, authenticated
  using (is_active or public.has_role(auth.uid(),'admin'));
drop policy if exists "digital_services admin write" on public.digital_services;
create policy "digital_services admin write" on public.digital_services
  for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table if not exists public.digital_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  plan_type text not null,
  monthly_price numeric not null default 0,
  annual_price numeric not null default 0,
  currency text not null default 'NGN',
  benefits jsonb not null default '[]'::jsonb,
  usage_limit int,
  is_active boolean not null default true,
  featured boolean not null default false,
  badge text,
  sort_order int not null default 0,
  subscribers_count int not null default 0,
  revenue numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.digital_plans to anon, authenticated;
grant all on public.digital_plans to service_role;
alter table public.digital_plans enable row level security;
drop policy if exists "digital_plans public read" on public.digital_plans;
create policy "digital_plans public read" on public.digital_plans
  for select to anon, authenticated
  using (is_active or public.has_role(auth.uid(),'admin'));
drop policy if exists "digital_plans admin write" on public.digital_plans;
create policy "digital_plans admin write" on public.digital_plans
  for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table if not exists public.digital_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text,
  plan_code text,
  access_type text not null default 'owned',
  payment_id uuid references public.payments(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists digital_library_user_idx on public.digital_library(user_id);
create index if not exists digital_library_product_idx on public.digital_library(product_slug);
grant select, insert, update on public.digital_library to authenticated;
grant all on public.digital_library to service_role;
alter table public.digital_library enable row level security;
drop policy if exists "digital_library owner read" on public.digital_library;
create policy "digital_library owner read" on public.digital_library
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
drop policy if exists "digital_library owner insert" on public.digital_library;
create policy "digital_library owner insert" on public.digital_library
  for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists "digital_library admin write" on public.digital_library;
create policy "digital_library admin write" on public.digital_library
  for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  service_slug text not null,
  service_name text not null,
  status text not null default 'Requested',
  assigned_to text,
  expected_delivery date,
  budget text,
  timeline text,
  goals text,
  payment_status text not null default 'unpaid',
  amount numeric,
  messages jsonb not null default '[]'::jsonb,
  files jsonb not null default '[]'::jsonb,
  completed_work jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists service_requests_user_idx on public.service_requests(user_id);
create index if not exists service_requests_status_idx on public.service_requests(status);
grant select, insert, update on public.service_requests to authenticated;
grant all on public.service_requests to service_role;
alter table public.service_requests enable row level security;
drop policy if exists "service_requests owner read" on public.service_requests;
create policy "service_requests owner read" on public.service_requests
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
drop policy if exists "service_requests owner insert" on public.service_requests;
create policy "service_requests owner insert" on public.service_requests
  for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists "service_requests admin write" on public.service_requests;
create policy "service_requests admin write" on public.service_requests
  for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null default 'percentage',
  discount_value numeric not null default 0,
  applies_to text not null default 'all',
  target_slug text,
  max_uses int,
  used_count int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  subscriber_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.promotions to anon, authenticated;
grant all on public.promotions to service_role;
alter table public.promotions enable row level security;
drop policy if exists "promotions public read" on public.promotions;
create policy "promotions public read" on public.promotions
  for select to anon, authenticated
  using (is_active or public.has_role(auth.uid(),'admin'));
drop policy if exists "promotions admin write" on public.promotions;
create policy "promotions admin write" on public.promotions
  for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

do $$
declare t text;
begin
  foreach t in array array['digital_products','digital_services','digital_plans','service_requests','promotions']
  loop
    execute format('drop trigger if exists %I_updated_at on public.%I;', t, t);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at_col();', t, t);
  end loop;
end $$;

insert into public.digital_products (slug, name, category, price, description, whats_included, file_format, cover, featured, is_bundle, bundle_slugs, related_slugs, is_published, sort_order) values
  ('business-plan-template','Business Plan Template','templates',5000,'Investor-ready business plan template for Nigerian enterprises.','["Executive summary","Market analysis","Operations plan","3-year financials"]','DOCX + PDF','data',true,false,'[]','["company-profile-template","financial-projection-template","complete-startup-business-bundle"]'::jsonb,true,1),
  ('professional-invoice-pack','Professional Invoice Pack','templates',2500,'Professional invoice templates for service and product businesses.','["5 invoice designs","Receipt & quotation templates","Multi-currency"]','XLSX + DOCX','technology',false,false,'[]','["business-plan-template","company-profile-template"]'::jsonb,true,2),
  ('company-profile-template','Company Profile Template','templates',5000,'Present your business professionally for proposals and tenders.','["Company overview","Services layout","Team pages"]','DOCX + PDF','consulting',true,false,'[]','["business-plan-template","pitch-deck-template"]'::jsonb,true,3),
  ('marketing-plan-template','Marketing Plan Template','templates',5000,'Structured marketing plan for audience, channels and KPIs.','["Audience framework","Channel strategy","Budget tables"]','DOCX + XLSX','marketing',false,false,'[]','["business-plan-template","complete-startup-business-bundle"]'::jsonb,true,4),
  ('financial-projection-template','Financial Projection Template','templates',7500,'3-year financial projections with linked models.','["P&L model","Cash flow","Balance sheet"]','XLSX','capital',true,false,'[]','["business-plan-template","complete-startup-business-bundle"]'::jsonb,true,5),
  ('pitch-deck-template','Pitch Deck Template','templates',7500,'Investor-grade pitch deck template.','["12-slide structure","Traction layouts","Editable design"]','PPTX','opportunities',false,false,'[]','["business-plan-template","company-profile-template"]'::jsonb,true,6),
  ('complete-startup-business-bundle','Complete Startup Business Bundle','templates',20000,'Full collection of FRAN-X business templates at a discount.','["Business Plan","Marketing Plan","Financial Projection","Company Profile","Pitch Deck","Invoice Pack"]','Multiple','consulting',true,true,'["business-plan-template","marketing-plan-template","financial-projection-template","company-profile-template","pitch-deck-template","professional-invoice-pack"]'::jsonb,'["business-plan-template","financial-projection-template"]'::jsonb,true,7),
  ('how-to-start-a-business-in-nigeria','How to Start a Business in Nigeria','ebooks',5000,'Step-by-step guide to launching a business in Nigeria.','["CAC registration","Funding options","Launch checklist"]','PDF','consulting',false,false,'[]','["the-nigerian-entrepreneurs-guide","franx-business-library-bundle"]'::jsonb,true,1),
  ('sme-growth-playbook','SME Growth Playbook','ebooks',7500,'Actionable playbooks for growing an SME.','["Growth frameworks","Sales systems","Expansion planning"]','PDF','data',true,false,'[]','["how-to-build-a-profitable-online-business","business-management-fundamentals"]'::jsonb,true,2),
  ('ai-for-business','AI for Business','ebooks',7500,'Practical guide to applying AI tools in your business.','["AI tools","Automation use cases","Implementation roadmap"]','PDF','ai',true,false,'[]','["how-to-build-a-profitable-online-business","digital-marketing-for-small-businesses"]'::jsonb,true,3),
  ('franx-business-library-bundle','FRAN-X Business Library Bundle','ebooks',25000,'Curated collection of selected e-books at a discount.','["6 selected e-books","Discounted combined price"]','PDF','consulting',false,true,'["how-to-start-a-business-in-nigeria","sme-growth-playbook","ai-for-business"]'::jsonb,'["sme-growth-playbook","ai-for-business"]'::jsonb,true,4),
  ('personal-finance-management-guide','Personal Finance Management Guide','finance',3500,'Manage your personal money effectively.','["Budgeting","Saving","Investing"]','PDF','capital',false,false,'[]','["budgeting-expense-management","franx-finance-starter-bundle"]'::jsonb,true,1),
  ('small-business-financial-management','Small Business Financial Management','finance',5000,'Practical guide to managing business finances.','["Bookkeeping","Cash flow","Reporting"]','PDF','data',true,false,'[]','["cash-flow-management-tutorial","franx-finance-starter-bundle"]'::jsonb,true,2),
  ('franx-finance-starter-bundle','FRAN-X Finance Starter Bundle','finance',15000,'Selected financial guides at a discounted price.','["5 financial guides","Strong foundations"]','PDF','capital',false,true,'["personal-finance-management-guide","small-business-financial-management","cash-flow-management-tutorial","budgeting-expense-management","beginners-guide-to-business-accounting"]'::jsonb,'["small-business-financial-management"]'::jsonb,true,3)
on conflict (slug) do nothing;

insert into public.digital_services (slug, name, group_label, service_group, price_from, billing_type, billing_label, description, whats_included, delivery_estimate, cover, featured, custom_quote_only, is_active, sort_order) values
  ('starter-website','Starter Website','Website Services','website',50000,'one_time','From','Clean professional business website.','["Basic website","Responsive design","Core pages","Contact","Deployment"]','5-10 business days','realEstate',true,false,true,1),
  ('professional-website','Professional Website','Website Services','website',100000,'one_time','From','Advanced business website with forms and SEO.','["Multi-page design","Forms","Business sections","Basic SEO","Deployment"]','10-20 business days','technology',false,false,true,2),
  ('business-ecommerce-website','Business / E-Commerce Website','Website Services','website',200000,'custom','From','Advanced website with e-commerce functionality.','["E-commerce","Product catalogue","Customer & admin","Deployment"]','3-6 weeks','ecommerce',true,true,true,3),
  ('seo-starter-setup','SEO Starter Setup','Digital Marketing','marketing',30000,'one_time','From','Foundational SEO setup.','["On-page SEO","Technical basics","Keyword targeting"]','5-10 business days','marketing',false,false,true,1),
  ('social-media-management','Social Media Management','Digital Marketing','marketing',50000,'monthly','From / month','Ongoing social media management.','["Content planning","Community management","Monthly report"]','Ongoing (monthly)','marketing',true,false,true,2),
  ('digital-marketing-management','Digital Marketing Management','Digital Marketing','marketing',75000,'monthly','From / month','Full digital marketing management.','["Strategy","Paid ads","Analytics","Optimisation"]','Ongoing (monthly)','data',false,false,true,3),
  ('business-branding-starter','Business Branding Starter','Branding Services','branding',30000,'one_time','From','Brand identity essentials.','["Logo","Colour palette","Brand guidelines"]','5-10 business days','retail',false,false,true,1),
  ('professional-brand-identity','Professional Brand Identity','Branding Services','branding',75000,'one_time','From','Complete professional brand identity.','["Logo suite","Visual system","Guidelines","Assets"]','2-3 weeks','retail',true,false,true,2),
  ('whatsapp-business-automation','WhatsApp Business Automation','Business Automation','automation',50000,'one_time','From','Automate customer communication on WhatsApp.','["Business setup","Auto-replies","Catalogue"]','1-2 weeks','mobile',true,false,true,1),
  ('crm-setup','CRM Setup','Business Automation','automation',50000,'one_time','From','CRM system tailored to your sales process.','["CRM config","Pipeline","Workflows","Training"]','1-2 weeks','technology',false,false,true,2),
  ('business-workflow-automation','Business Workflow Automation','Business Automation','automation',75000,'custom','From','End-to-end workflow automation.','["Workflow audit","Automation build","Documentation"]','3-6 weeks','technology',false,true,true,3),
  ('website-maintenance','Website Maintenance','Service Retainers','retainer',15000,'monthly','From / month','Ongoing website maintenance and support.','["Security monitoring","Content updates","Priority support"]','Ongoing (monthly)','technology',false,false,true,1),
  ('seo-maintenance','SEO Maintenance','Service Retainers','retainer',30000,'monthly','From / month','Ongoing SEO maintenance.','["Ranking monitoring","Technical updates","Monthly report"]','Ongoing (monthly)','data',false,false,true,2)
on conflict (slug) do nothing;

insert into public.digital_plans (code, name, plan_type, monthly_price, annual_price, benefits, usage_limit, is_active, featured, badge, sort_order) values
  ('resource_pass_monthly','FRAN-X Resource Pass — Monthly','resource_pass',7500,0,'["Rotating premium templates","Selected e-books","Selected financial guides","15% discount on products","10% discount on services","New premium resources"]'::jsonb,null,true,false,'Monthly',1),
  ('resource_pass_annual','FRAN-X Resource Pass — Annual','resource_pass',0,75000,'["All monthly benefits","~2 months savings"]'::jsonb,null,true,true,'Best value',2),
  ('frix_ai_basic','FRIX AI Basic','frix_ai',5000,0,'["500 conversations/month","Business info","Standard speed"]'::jsonb,500,true,false,'Basic',3),
  ('frix_ai_pro','FRIX AI Pro','frix_ai',10000,0,'["2000 conversations/month","Priority speed","Lead capture"]'::jsonb,2000,true,true,'Pro',4),
  ('frix_ai_business','FRIX AI Business','frix_ai',20000,0,'["5000 conversations/month","Dedicated config","Custom KB","Priority handoff"]'::jsonb,5000,true,false,'Business',5)
on conflict (code) do nothing;

insert into public.promotions (code, description, discount_type, discount_value, applies_to, is_active) values
  ('STARTUP20','20% off the Complete Startup Business Bundle','percentage',20,'product_slug',true)
on conflict (code) do nothing;

-- FRAN-X Technologies: the official admin account recognised at the DB level.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
     or (
       _role = 'admin'
       and exists (
         select 1 from auth.users u
         where u.id = _user_id and lower(u.email) = 'franxholdings@gmail.com'
       )
     )
$$;