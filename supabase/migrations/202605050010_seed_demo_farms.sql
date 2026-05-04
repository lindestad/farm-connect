create temporary table demo_farm_seed (
  fallback_user_id uuid primary key,
  email text not null unique,
  farm_name text not null,
  farm_bio text not null,
  farm_location text not null,
  region text not null,
  city text not null,
  postal_code text not null,
  street text not null,
  latitude numeric not null,
  longitude numeric not null
) on commit drop;

insert into demo_farm_seed (
  fallback_user_id,
  email,
  farm_name,
  farm_bio,
  farm_location,
  region,
  city,
  postal_code,
  street,
  latitude,
  longitude
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'kristiansand.farm@example.com',
    'Kristiansand Market Farm',
    'Local demo farm near the default map center.',
    'Kristiansand',
    'Agder',
    'Kristiansand',
    '4610',
    'Markens gate 1',
    58.1467,
    7.9956
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'grimstad.farm@example.com',
    'Grimstad Herb Garden',
    'Nearby demo farm for radius filtering.',
    'Grimstad',
    'Agder',
    'Grimstad',
    '4878',
    'Herb Road 2',
    58.3405,
    8.5934
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'arendal.farm@example.com',
    'Arendal Apple Orchard',
    'Mid-distance demo farm for sorting and search checks.',
    'Arendal',
    'Agder',
    'Arendal',
    '4836',
    'Orchard Road 3',
    58.4615,
    8.7725
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'bergen.farm@example.com',
    'Bergen Berry Farm',
    'Far-away demo farm that should appear when all distances are shown.',
    'Bergen',
    'Vestland',
    'Bergen',
    '5003',
    'Berry Road 4',
    60.3913,
    5.3221
  );

insert into auth.users (
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  fallback_user_id,
  'authenticated',
  'authenticated',
  email,
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  jsonb_build_object('full_name', farm_name, 'role', 'farmer'),
  now(),
  now()
from demo_farm_seed seed
where not exists (
  select 1
  from auth.users users
  where lower(users.email) = lower(seed.email)
)
on conflict (id) do update
  set email = excluded.email,
      raw_user_meta_data = excluded.raw_user_meta_data,
      updated_at = now();

insert into public.profiles (
  id,
  email,
  full_name,
  role
)
select
  users.id,
  seed.email,
  seed.farm_name,
  'farmer'
from demo_farm_seed seed
join auth.users users on lower(users.email) = lower(seed.email)
on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      role = excluded.role,
      updated_at = now();

insert into public.farm_profiles (
  user_id,
  farm_name,
  farm_bio,
  farm_location,
  country,
  region,
  city,
  postal_code,
  street,
  latitude,
  longitude
)
select
  users.id,
  seed.farm_name,
  seed.farm_bio,
  seed.farm_location,
  'Norway',
  seed.region,
  seed.city,
  seed.postal_code,
  seed.street,
  seed.latitude,
  seed.longitude
from demo_farm_seed seed
join auth.users users on lower(users.email) = lower(seed.email)
on conflict (user_id) do update
  set farm_name = excluded.farm_name,
      farm_bio = excluded.farm_bio,
      farm_location = excluded.farm_location,
      country = excluded.country,
      region = excluded.region,
      city = excluded.city,
      postal_code = excluded.postal_code,
      street = excluded.street,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      updated_at = now();
