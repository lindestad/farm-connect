drop policy if exists "pickup_inventory_select_profile_read" on public.pickup_inventory;
create policy "pickup_inventory_select_profile_read"
on public.pickup_inventory
for select
to anon, authenticated
using (is_available = true and available_quantity > 0);

drop policy if exists "pickup_time_slots_select_profile_read" on public.pickup_time_slots;
create policy "pickup_time_slots_select_profile_read"
on public.pickup_time_slots
for select
to anon, authenticated
using (slot_date >= current_date);
