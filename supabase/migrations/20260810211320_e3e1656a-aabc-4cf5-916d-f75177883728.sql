-- roles
create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  company text,
  country text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "own profile write" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  if new.email_confirmed_at is not null and lower(new.email) = 'franxholdings@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.grant_admin_on_confirm()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null and lower(new.email) = 'franxholdings@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end; $$;
create trigger on_auth_user_confirmed after update of email_confirmed_at on auth.users
for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
execute function public.grant_admin_on_confirm();

-- services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null,
  cta text not null default 'Request This Service',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "public services read" on public.services for select to anon, authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "admin services write" on public.services for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- companies
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  industry text not null,
  description text not null,
  status text not null default 'Planned',
  link text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.companies to anon, authenticated;
grant insert, update, delete on public.companies to authenticated;
grant all on public.companies to service_role;
alter table public.companies enable row level security;
create policy "public companies read" on public.companies for select to anon, authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "admin companies write" on public.companies for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- inquiries / leads
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  kind text not null default 'service',
  category text,
  service text,
  full_name text not null,
  email text not null,
  phone text,
  company text,
  country text,
  description text not null,
  budget text,
  timeline text,
  contact_method text,
  details jsonb not null default '{}'::jsonb,
  status text not null default 'New',
  assigned_to text,
  estimated_value numeric,
  source text default 'website',
  last_contact timestamptz,
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert on public.inquiries to authenticated;
grant update, delete on public.inquiries to authenticated;
grant all on public.inquiries to service_role;
alter table public.inquiries enable row level security;
create policy "own inquiries read" on public.inquiries for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "own inquiries insert" on public.inquiries for insert to authenticated with check (auth.uid() = user_id);
create policy "admin inquiries update" on public.inquiries for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin inquiries delete" on public.inquiries for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.inquiry_notes to authenticated;
grant all on public.inquiry_notes to service_role;
alter table public.inquiry_notes enable row level security;
create policy "admin notes read" on public.inquiry_notes for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin notes insert" on public.inquiry_notes for insert to authenticated with check (public.has_role(auth.uid(),'admin'));

-- messages (user <-> admin chat)
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_user_id uuid not null references auth.users(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  from_admin boolean not null default false,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "thread read" on public.messages for select to authenticated using (auth.uid() = thread_user_id or public.has_role(auth.uid(),'admin'));
create policy "thread insert" on public.messages for insert to authenticated with check (sender_id = auth.uid() and (thread_user_id = auth.uid() or public.has_role(auth.uid(),'admin')));
create policy "thread update" on public.messages for update to authenticated using (auth.uid() = thread_user_id or public.has_role(auth.uid(),'admin')) with check (auth.uid() = thread_user_id or public.has_role(auth.uid(),'admin'));
alter publication supabase_realtime add table public.messages;

-- visits
create table public.site_visits (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant insert on public.site_visits to anon, authenticated;
grant select on public.site_visits to authenticated;
grant all on public.site_visits to service_role;
alter table public.site_visits enable row level security;
create policy "anyone can log a visit" on public.site_visits for insert to anon, authenticated with check (true);
create policy "admin visits read" on public.site_visits for select to authenticated using (public.has_role(auth.uid(),'admin'));

create index on public.inquiries (created_at desc);
create index on public.messages (thread_user_id, created_at desc);
create index on public.site_visits (created_at desc);

insert into public.services (slug,name,category,description,cta,sort_order) values
('website-development','Website Development','Technology & Digital','Business, corporate, e-commerce, landing, portfolio, booking, SaaS and custom web platforms built end to end.','Build My Website',1),
('mobile-app-development','Mobile App Development','Technology & Digital','Android, iOS, cross-platform, business, e-commerce and AI-powered mobile applications.','Build My App',2),
('web-application-development','Web Application Development','Technology & Digital','Custom web applications, internal tools and customer-facing platforms.','Request This Service',3),
('backend-development','Backend Development','Technology & Digital','APIs, business logic, secure server infrastructure and integrations.','Request This Service',4),
('database-development','Database Development','Technology & Digital','Schema design, data modelling, migrations and performance tuning.','Request This Service',5),
('api-integration','API Integration','Technology & Digital','Connect third-party systems, services and internal platforms.','Request This Service',6),
('payment-integration','Payment Integration','Technology & Digital','Local and international payment gateways wired into your platform.','Request This Service',7),
('admin-dashboard-development','Admin Dashboard Development','Technology & Digital','Operational dashboards, reporting views and internal control panels.','Request This Service',8),
('cloud-digital-infrastructure','Cloud & Digital Infrastructure','Technology & Digital','Hosting, deployment pipelines, scaling and cloud architecture.','Request This Service',9),
('digital-transformation-consulting','Digital Transformation Consulting','Technology & Digital','Move manual operations onto modern digital systems.','Request This Service',10),
('software-architecture','Software Architecture','Technology & Digital','Technical architecture, scalability planning and system design.','Request This Service',11),
('custom-business-systems','Custom Business Systems','Technology & Digital','Bespoke internal software built around your operating model.','Request This Service',12),
('ai-application-development','AI Application Development','AI & Automation','Custom AI-powered products and internal AI tools.','Build an AI Solution',13),
('ai-chatbot-development','AI Chatbot Development','AI & Automation','Customer support, sales and internal assistant chatbots.','Build an AI Solution',14),
('ai-integration','AI Integration','AI & Automation','Embed AI models into your existing website, app or workflow.','Build an AI Solution',15),
('ai-automation','AI Automation','AI & Automation','Automate repetitive operational and commercial workflows.','Build an AI Solution',16),
('business-process-automation','Business Process Automation','AI & Automation','Reduce manual work across sales, admin and operations.','Build an AI Solution',17),
('ai-api-integration','AI API Integration','AI & Automation','Connect leading AI APIs securely into your systems.','Build an AI Solution',18),
('custom-ai-solutions','Custom AI Solutions','AI & Automation','Tailored AI systems designed around your business problem.','Build an AI Solution',19),
('ai-powered-customer-support','AI-Powered Customer Support','AI & Automation','Always-on assisted support across your channels.','Build an AI Solution',20),
('ai-powered-business-tools','AI-Powered Business Tools','AI & Automation','Internal AI tooling for research, drafting and analysis.','Build an AI Solution',21),
('business-consulting','Business Consulting','Business & Data','Advisory on structure, growth, operations and commercial strategy.','Request Business Consulting',22),
('business-strategy','Business Strategy','Business & Data','Strategic planning and execution roadmaps.','Request Business Consulting',23),
('business-research','Business Research','Business & Data','Structured research to support commercial decisions.','Request Business Consulting',24),
('market-research','Market Research','Business & Data','Market sizing, demand analysis and opportunity mapping.','Request Business Consulting',25),
('competitor-analysis','Competitor Analysis','Business & Data','Benchmarking, positioning and competitive intelligence.','Request Business Consulting',26),
('data-analysis','Data Analysis','Business & Data','Turn raw business data into decisions.','Request Business Consulting',27),
('business-model-development','Business Model Development','Business & Data','Design and validate revenue and operating models.','Request Business Consulting',28),
('startup-planning','Startup Planning','Business & Data','From concept to structured, fundable business plan.','Request Business Consulting',29),
('business-process-optimization','Business Process Optimization','Business & Data','Streamline operations and remove bottlenecks.','Request Business Consulting',30),
('digital-transformation','Digital Transformation','Business & Data','Modernise the way your business runs.','Request Business Consulting',31),
('business-development','Business Development','Business & Data','Pipeline building, partnerships and expansion.','Request Business Consulting',32),
('commercial-strategy','Commercial Strategy','Business & Data','Pricing, channel and go-to-market strategy.','Request Business Consulting',33),
('copywriting','Copywriting','Marketing & Copywriting','Persuasive commercial copy for any channel.','Request Marketing Services',34),
('business-writing','Business Writing','Marketing & Copywriting','Proposals, profiles, decks and corporate documents.','Request Marketing Services',35),
('website-copy','Website Copy','Marketing & Copywriting','Conversion-focused copy for every page of your site.','Request Marketing Services',36),
('product-descriptions','Product Descriptions','Marketing & Copywriting','Clear, search-friendly product content.','Request Marketing Services',37),
('seo-content','SEO Content','Marketing & Copywriting','Content built around real search demand.','Request Marketing Services',38),
('marketing-content','Marketing Content','Marketing & Copywriting','Campaign content across digital channels.','Request Marketing Services',39),
('product-listing-optimization','Product Listing Optimization','Marketing & Copywriting','Improve visibility and conversion on marketplaces.','Request Marketing Services',40),
('digital-marketing-strategy','Digital Marketing Strategy','Marketing & Copywriting','Channel strategy, funnels and measurement.','Request Marketing Services',41),
('social-media-content','Social Media Content','Marketing & Copywriting','Consistent, on-brand social content.','Request Marketing Services',42),
('brand-messaging','Brand Messaging','Marketing & Copywriting','Positioning, tone of voice and messaging frameworks.','Request Marketing Services',43),
('promotional-graphics','Promotional Graphics','Creative & Media','Campaign and promotional visual assets.','Request Creative Services',44),
('product-visuals','Product Visuals','Creative & Media','Product-focused imagery and graphics.','Request Creative Services',45),
('video-editing','Video Editing','Creative & Media','Professional editing for commercial video.','Request Creative Services',46),
('product-video-editing','Product Video Editing','Creative & Media','Short-form product videos that sell.','Request Creative Services',47),
('social-media-creative-content','Social Media Creative Content','Creative & Media','Creative assets built for social platforms.','Request Creative Services',48),
('digital-branding-support','Digital Branding Support','Creative & Media','Visual identity support across digital touchpoints.','Request Creative Services',49),
('promotional-content','Promotional Content','Creative & Media','Launch and campaign creative packages.','Request Creative Services',50),
('e-commerce-store-setup','E-commerce Store Setup','E-commerce','Full online store build and configuration.','Build My Online Store',51),
('product-uploading','Product Uploading','E-commerce','Bulk product upload and data entry.','Build My Online Store',52),
('product-catalog-management','Product Catalog Management','E-commerce','Ongoing catalogue structure and maintenance.','Build My Online Store',53),
('e-commerce-seo','E-commerce SEO','E-commerce','Search visibility for category and product pages.','Build My Online Store',54),
('store-optimization','Store Optimization','E-commerce','Improve speed, UX and conversion rate.','Build My Online Store',55),
('dropshipping-consulting','Dropshipping Consulting','E-commerce','Supplier, margin and fulfilment guidance.','Build My Online Store',56),
('e-commerce-strategy','E-commerce Strategy','E-commerce','Channel, pricing and growth strategy for online retail.','Build My Online Store',57),
('online-store-management','Online Store Management','E-commerce','Day-to-day management of your storefront.','Build My Online Store',58),
('listing-optimization','Listing Optimization','E-commerce','Optimised listings across marketplaces.','Build My Online Store',59),
('real-estate-consulting','Real Estate Consulting','Real Estate','Advisory across acquisition, disposal and investment.','Find a Property',60),
('property-sourcing','Property Sourcing','Real Estate','Sourcing properties that match your brief.','Find a Property',61),
('property-buying-assistance','Property Buying Assistance','Real Estate','Guided support through the buying process.','Find a Property',62),
('property-selling-assistance','Property Selling Assistance','Real Estate','Positioning and marketing your property to buyers.','Find a Property',63),
('property-investment-consulting','Property Investment Consulting','Real Estate','Investment analysis and portfolio guidance.','Find a Property',64),
('real-estate-market-research','Real Estate Market Research','Real Estate','Location, pricing and demand research.','Find a Property',65),
('property-marketing','Property Marketing','Real Estate','Digital marketing campaigns for property listings.','Find a Property',66),
('client-property-matching','Client-Property Matching','Real Estate','Matching verified requirements to available properties.','Find a Property',67),
('real-estate-deal-facilitation','Real Estate Deal Facilitation','Real Estate','Coordination between parties through to close.','Find a Property',68),
('property-opportunity-sourcing','Property Opportunity Sourcing','Real Estate','Identifying off-market and emerging opportunities.','Submit a Property Opportunity',69),
('car-agency','Car Agency','Automotive','Agency services for buyers and sellers of vehicles.','Find a Vehicle',70),
('auto-brokerage','Auto Brokerage','Automotive','Brokerage support across vehicle transactions.','Find a Vehicle',71),
('vehicle-sourcing','Vehicle Sourcing','Automotive','Sourcing vehicles to your specification and budget.','Find a Vehicle',72),
('car-buying-assistance','Car Buying Assistance','Automotive','End-to-end assistance for vehicle purchase.','Find a Vehicle',73),
('car-selling-assistance','Car Selling Assistance','Automotive','Reach the right buyers for your vehicle.','Sell a Vehicle',74),
('vehicle-inspection-coordination','Vehicle Inspection Coordination','Automotive','Coordinating independent inspection before purchase.','Find a Vehicle',75),
('vehicle-price-research','Vehicle Price Research','Automotive','Fair-market pricing research and benchmarking.','Find a Vehicle',76),
('client-dealer-matching','Client-Dealer Matching','Automotive','Connecting buyers with suitable dealers.','Find a Vehicle',77),
('auto-deal-facilitation','Auto Deal Facilitation','Automotive','Coordinating the transaction to completion.','Find a Vehicle',78),
('vehicle-opportunity-sourcing','Vehicle Opportunity Sourcing','Automotive','Identifying fleet and bulk vehicle opportunities.','Find a Vehicle',79),
('oil-gas-consulting','Oil & Gas Consulting','Oil & Gas / Energy','Commercial advisory across the energy value chain.','Submit an Energy Inquiry',80),
('energy-business-development','Energy Business Development','Oil & Gas / Energy','Building commercial pipelines in the energy sector.','Submit an Energy Inquiry',81),
('buyer-seller-matching','Buyer-Seller Matching','Oil & Gas / Energy','Introducing verified counterparties.','Submit an Energy Inquiry',82),
('oil-gas-deal-facilitation','Oil & Gas Deal Facilitation','Oil & Gas / Energy','Coordinating commercial energy transactions.','Submit an Energy Inquiry',83),
('supplier-identification','Supplier Identification','Oil & Gas / Energy','Identifying credible suppliers for your requirement.','Submit an Energy Inquiry',84),
('buyer-identification','Buyer Identification','Oil & Gas / Energy','Identifying credible off-takers and buyers.','Submit an Energy Inquiry',85),
('petroleum-product-sourcing-assistance','Petroleum Product Sourcing Assistance','Oil & Gas / Energy','Sourcing support subject to applicable licensing.','Submit an Energy Inquiry',86),
('oil-gas-market-research','Oil & Gas Market Research','Oil & Gas / Energy','Pricing, demand and market structure research.','Submit an Energy Inquiry',87),
('off-taker-supplier-introductions','Off-taker & Supplier Introductions','Oil & Gas / Energy','Structured introductions between parties.','Submit an Energy Inquiry',88),
('commercial-deal-coordination','Commercial Deal Coordination','Oil & Gas / Energy','Coordination and follow-through on commercial terms.','Submit an Energy Inquiry',89),
('energy-project-sourcing','Energy Project Sourcing','Oil & Gas / Energy','Sourcing energy projects and mandates.','Submit an Energy Opportunity',90),
('transaction-coordination','Transaction Coordination','Oil & Gas / Energy','Documentation and process coordination support.','Submit an Energy Inquiry',91),
('energy-investment-opportunity-sourcing','Energy Investment Opportunity Sourcing','Oil & Gas / Energy','Identifying investable energy opportunities.','Submit an Energy Opportunity',92)
on conflict (slug) do nothing;

insert into public.companies (slug,name,industry,description,status,sort_order) values
('fx-capital','F.X. CAPITAL','Investment & Capital','Investment, capital allocation and opportunity structuring across the FRAN-X portfolio.','In Development',1),
('fx-oil','F.X. OIL','Oil & Gas / Energy','Energy commercial development, deal coordination and opportunity sourcing.','In Development',2),
('fx-realty','F.X. REALTY','Real Estate','Property sourcing, advisory, marketing and client-property matching.','In Development',3),
('fx-hotels','F.X. HOTELS','Hospitality','Hospitality assets and guest experience ventures.','Planned',4),
('fx-air','F.X. AIR','Aviation','Aviation services and travel-related commercial ventures.','Future Venture',5),
('fx-auto','F.X. AUTO','Automotive','Vehicle sourcing, brokerage and automotive deal facilitation.','In Development',6),
('fx-tech','F.X. TECH','Technology','Software, web, mobile and digital infrastructure engineering.','Operating',7),
('frix-ai','FRIX AI','Artificial Intelligence','AI products, chatbots, automation and intelligent business tooling.','In Development',8),
('fx-vault','F.X. VAULT','Digital Assets & Security','Secure digital asset, data and value-storage initiatives.','Planned',9),
('fx-agric','F.X. AGRIC','Agriculture','Agricultural production, supply and agribusiness development.','Planned',10),
('eaizystore','EaizyStore','E-commerce','Online retail, store operations and marketplace commerce.','Operating',11)
on conflict (slug) do nothing;