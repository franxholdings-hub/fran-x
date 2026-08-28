-- Auto-create a FRAN-X Explorer 7-day free trial when a new user signs up.
-- Runs as SECURITY DEFINER (bypasses RLS) so the insert succeeds without
-- the new user having any role yet.
create or replace function public.handle_new_user_trial()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  explorer_id uuid;
begin
  select id into explorer_id from public.ai_packages where code = 'explorer' limit 1;
  if explorer_id is not null then
    insert into public.subscriptions (user_id, plan_id, status, started_at, trial_ends_at)
    values (new.id, explorer_id, 'trial', now(), now() + interval '7 days');
  end if;
  return new;
end;
$$;

revoke execute on function public.handle_new_user_trial() from anon, authenticated, public;

drop trigger if exists on_auth_user_created_trial on auth.users;
create trigger on_auth_user_created_trial
  after insert on auth.users
  for each row execute function public.handle_new_user_trial();
