create extension if not exists pgcrypto;

create table if not exists public.market_days (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  location text not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (end_time > start_time)
);

create index if not exists market_days_farmer_date_idx
on public.market_days (farmer_id, date, start_time);

create table if not exists public.pickup_inventory (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references auth.users (id) on delete cascade,
  produce_id text,
  produce_name text not null,
  available_quantity numeric not null default 0 check (available_quantity >= 0),
  unit text not null default 'kg',
  price_text text,
  notes text,
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists pickup_inventory_farmer_name_idx
on public.pickup_inventory (farmer_id, produce_name);

create table if not exists public.pickup_time_slots (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references auth.users (id) on delete cascade,
  slot_date date not null,
  start_time time not null,
  end_time time not null,
  capacity integer not null default 1 check (capacity > 0),
  location text not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (end_time > start_time)
);

create index if not exists pickup_time_slots_farmer_date_idx
on public.pickup_time_slots (farmer_id, slot_date, start_time);

alter table public.market_days enable row level security;
alter table public.pickup_inventory enable row level security;
alter table public.pickup_time_slots enable row level security;

drop policy if exists "market_days_select_own" on public.market_days;
create policy "market_days_select_own"
on public.market_days
for select
to authenticated
using (auth.uid() = farmer_id);

drop policy if exists "market_days_insert_own" on public.market_days;
create policy "market_days_insert_own"
on public.market_days
for insert
to authenticated
with check (auth.uid() = farmer_id);

drop policy if exists "market_days_update_own" on public.market_days;
create policy "market_days_update_own"
on public.market_days
for update
to authenticated
using (auth.uid() = farmer_id)
with check (auth.uid() = farmer_id);

drop policy if exists "market_days_delete_own" on public.market_days;
create policy "market_days_delete_own"
on public.market_days
for delete
to authenticated
using (auth.uid() = farmer_id);

drop policy if exists "pickup_inventory_select_own" on public.pickup_inventory;
create policy "pickup_inventory_select_own"
on public.pickup_inventory
for select
to authenticated
using (auth.uid() = farmer_id);

drop policy if exists "pickup_inventory_insert_own" on public.pickup_inventory;
create policy "pickup_inventory_insert_own"
on public.pickup_inventory
for insert
to authenticated
with check (auth.uid() = farmer_id);

drop policy if exists "pickup_inventory_update_own" on public.pickup_inventory;
create policy "pickup_inventory_update_own"
on public.pickup_inventory
for update
to authenticated
using (auth.uid() = farmer_id)
with check (auth.uid() = farmer_id);

drop policy if exists "pickup_inventory_delete_own" on public.pickup_inventory;
create policy "pickup_inventory_delete_own"
on public.pickup_inventory
for delete
to authenticated
using (auth.uid() = farmer_id);

drop policy if exists "pickup_time_slots_select_own" on public.pickup_time_slots;
create policy "pickup_time_slots_select_own"
on public.pickup_time_slots
for select
to authenticated
using (auth.uid() = farmer_id);

drop policy if exists "pickup_time_slots_insert_own" on public.pickup_time_slots;
create policy "pickup_time_slots_insert_own"
on public.pickup_time_slots
for insert
to authenticated
with check (auth.uid() = farmer_id);

drop policy if exists "pickup_time_slots_update_own" on public.pickup_time_slots;
create policy "pickup_time_slots_update_own"
on public.pickup_time_slots
for update
to authenticated
using (auth.uid() = farmer_id)
with check (auth.uid() = farmer_id);

drop policy if exists "pickup_time_slots_delete_own" on public.pickup_time_slots;
create policy "pickup_time_slots_delete_own"
on public.pickup_time_slots
for delete
to authenticated
using (auth.uid() = farmer_id);
