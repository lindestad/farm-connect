drop policy if exists "market_days_select_own" on public.market_days;
drop policy if exists "market_days_select_profile_read" on public.market_days;

create policy "market_days_select_profile_read"
on public.market_days
for select
to anon, authenticated
using (true);
