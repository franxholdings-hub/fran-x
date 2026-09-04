-- FRAN-X Technologies: the official admin account.
--
-- Any user that registers or signs in with franxholdings@gmail.com is an
-- administrator. This extends the existing has_role() helper (used by every
-- RLS policy) so the admin email is recognized at the database level too,
-- without needing a user_roles row for that account.

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
