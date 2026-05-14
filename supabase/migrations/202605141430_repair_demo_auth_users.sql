-- Rebuild only the two login demo auth users.
--
-- The full demo seed was already applied before its password hashing was fixed,
-- so this migration repairs the applied auth rows without rerunning the full
-- dataset. The temporary FK drops keep the rest of the seeded demo data attached
-- to the same UUIDs while auth.users is deleted and recreated.

create temporary table _demo_auth_users (
  id uuid primary key,
  email text not null unique,
  password text not null default 'DemoPass123!',
  full_name text not null,
  role text not null check (role in ('customer', 'farmer'))
) on commit drop;

insert into _demo_auth_users (id, email, full_name, role)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'customer-demo@demo.com', 'Customer Demo', 'customer'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'farmer-demo@demo.com', 'Farmer Demo', 'farmer');

-- Preserve any already-applied demo UUIDs, because the full demo seed reused
-- pre-existing demo accounts by email before inserting the dependent data.
update _demo_auth_users demo
set id = users.id
from auth.users users
where lower(users.email) = lower(demo.email);

alter table if exists public.profiles
  drop constraint if exists profiles_id_fkey;

alter table if exists public.farm_profiles
  drop constraint if exists farm_profiles_user_id_fkey;

alter table if exists public.push_tokens
  drop constraint if exists push_tokens_user_id_fkey;

alter table if exists public.pickup_inventory
  drop constraint if exists pickup_inventory_farmer_id_fkey;

alter table if exists public.pickup_time_slots
  drop constraint if exists pickup_time_slots_farmer_id_fkey;

delete from auth.identities identities
using _demo_auth_users demo
where identities.user_id = demo.id
   or (
     identities.provider = 'email'
     and (
       lower(identities.provider_id) = lower(demo.email)
       or lower(identities.identity_data ->> 'email') = lower(demo.email)
     )
   );

delete from auth.users users
using _demo_auth_users demo
where users.id = demo.id
   or lower(users.email) = lower(demo.email);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  '00000000-0000-0000-0000-000000000000',
  id,
  'authenticated',
  'authenticated',
  email,
  extensions.crypt(password, extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  jsonb_build_object('full_name', full_name, 'role', role),
  now(),
  now()
from _demo_auth_users;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'users'
      and column_name = 'confirmation_sent_at'
  ) then
    execute '
      update auth.users users
      set confirmation_sent_at = coalesce(users.confirmation_sent_at, users.email_confirmed_at)
      from _demo_auth_users demo
      where users.id = demo.id
    ';
  end if;
end;
$$;

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  id,
  id,
  id::text,
  jsonb_build_object(
    'sub', id::text,
    'email', email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(),
  now(),
  now()
from _demo_auth_users
on conflict (provider_id, provider) do update
set user_id = excluded.user_id,
    identity_data = excluded.identity_data,
    updated_at = now();

alter table if exists public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade not valid;

alter table if exists public.profiles
  validate constraint profiles_id_fkey;

alter table if exists public.farm_profiles
  add constraint farm_profiles_user_id_fkey
  foreign key (user_id) references auth.users(id) on update cascade on delete cascade not valid;

alter table if exists public.farm_profiles
  validate constraint farm_profiles_user_id_fkey;

alter table if exists public.push_tokens
  add constraint push_tokens_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade not valid;

alter table if exists public.push_tokens
  validate constraint push_tokens_user_id_fkey;

alter table if exists public.pickup_inventory
  add constraint pickup_inventory_farmer_id_fkey
  foreign key (farmer_id) references auth.users(id) on delete cascade not valid;

alter table if exists public.pickup_inventory
  validate constraint pickup_inventory_farmer_id_fkey;

alter table if exists public.pickup_time_slots
  add constraint pickup_time_slots_farmer_id_fkey
  foreign key (farmer_id) references auth.users(id) on delete cascade not valid;

alter table if exists public.pickup_time_slots
  validate constraint pickup_time_slots_farmer_id_fkey;
