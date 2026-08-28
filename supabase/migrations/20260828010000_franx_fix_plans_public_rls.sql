-- Fix ai_packages public-read RLS: the previous policy called public.has_role()
-- inside the anon select policy, but anon does not have EXECUTE on has_role,
-- which broke public reads (401 "permission denied for function has_role").
-- Split into a plain "active plans are public" policy and a separate admin
-- read-all policy so anonymous visitors (and the pricing page) can read plans.
drop policy if exists "ai_packages public read" on public.ai_packages;
create policy "ai_packages public read" on public.ai_packages
  for select to anon, authenticated using (is_active);

create policy "ai_packages admin read all" on public.ai_packages
  for select to authenticated using (public.has_role(auth.uid(),'admin'));
