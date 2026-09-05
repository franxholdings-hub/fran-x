-- ============================================================
-- FRAN-X DIGITAL PRODUCT FILE SYSTEM
--
-- Admin-managed downloadable files for the Digital Store:
--   - Full product files (PDF e-books, DOCX/XLSX/PPTX templates, ZIP packs)
--   - Preview / sample files (publicly viewable)
--   - Cover images
--   - Admin-editable product notes / instructions
--
-- Files live in a PRIVATE storage bucket ("product-files"). Nothing is
-- publicly reachable: downloads go through the server API, which checks
-- the buyer's verified purchase (digital_library) before issuing a
-- short-lived signed URL. Preview/cover files are the only exceptions.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Admin-editable notes / instructions on every product.
-- ------------------------------------------------------------
alter table public.digital_products
  add column if not exists notes text;

-- ------------------------------------------------------------
-- 2. PRODUCT FILES — one product can have many downloadable files.
--    kind: 'product' (paid, purchase-gated) | 'preview' (free sample)
--          | 'cover' (listing image)
-- ------------------------------------------------------------
create table if not exists public.digital_product_files (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.digital_products(slug) on delete cascade,
  kind text not null default 'product' check (kind in ('product','preview','cover')),
  file_name text not null,
  storage_path text not null,                    -- object path inside the product-files bucket
  mime_type text not null default '',
  file_size bigint not null default 0,
  version int not null default 1,               -- incremented on replace
  downloads int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists digital_product_files_slug_idx on public.digital_product_files(product_slug);
create index if not exists digital_product_files_kind_idx on public.digital_product_files(kind);

grant select on public.digital_product_files to anon, authenticated;
grant all on public.digital_product_files to service_role;

alter table public.digital_product_files enable row level security;

-- Preview + cover files are meant to be public (samples and listing images).
drop policy if exists "digital_product_files sample public read" on public.digital_product_files;
create policy "digital_product_files sample public read" on public.digital_product_files
  for select to anon, authenticated
  using (kind in ('preview','cover'));

-- Paid product files: readable ONLY by customers with active access
-- (an owned purchase or an unexpired subscription in digital_library).
drop policy if exists "digital_product_files owner read" on public.digital_product_files;
create policy "digital_product_files owner read" on public.digital_product_files
  for select to authenticated
  using (
    kind = 'product'
    and exists (
      select 1 from public.digital_library l
      where l.user_id = auth.uid()
        and l.product_slug = digital_product_files.product_slug
        and l.is_active
        and (l.expires_at is null or l.expires_at > now())
    )
  );

-- Admins see and manage everything.
drop policy if exists "digital_product_files admin read" on public.digital_product_files;
create policy "digital_product_files admin read" on public.digital_product_files
  for select to authenticated
  using (public.has_role(auth.uid(),'admin'));
drop policy if exists "digital_product_files admin write" on public.digital_product_files;
create policy "digital_product_files admin write" on public.digital_product_files
  for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- updated_at trigger
drop trigger if exists digital_product_files_updated_at on public.digital_product_files;
create trigger digital_product_files_updated_at
  before update on public.digital_product_files
  for each row execute function public.set_updated_at_col();

-- ------------------------------------------------------------
-- 3. PRIVATE STORAGE BUCKET — paid files are never public.
--    Downloads are issued as short-lived signed URLs by the server
--    API after the purchase check. Admins manage objects via RLS.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', false)
on conflict (id) do nothing;

drop policy if exists "product files admin all" on storage.objects;
create policy "product files admin all" on storage.objects
  for all to authenticated
  using (bucket_id = 'product-files' and public.has_role(auth.uid(),'admin'))
  with check (bucket_id = 'product-files' and public.has_role(auth.uid(),'admin'));
