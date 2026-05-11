-- Full demo dataset for the shared demo/testing database.
-- This migration preserves existing app data and upserts a rich demo setup with
-- login-ready customer and farmer accounts.
--
-- Demo credentials for all seeded users:
--   password: DemoPass123!
--
-- Primary demo accounts:
--   customer-demo@demo.com
--   farmer-demo@demo.com

create extension if not exists pgcrypto;

create or replace function pg_temp.demo_uuid(seed text)
returns uuid
language sql
immutable
as $$
  select (
    substr(md5(seed), 1, 8) || '-' ||
    substr(md5(seed), 9, 4) || '-4' ||
    substr(md5(seed), 13, 3) || '-8' ||
    substr(md5(seed), 16, 3) || '-' ||
    substr(md5(seed), 19, 12)
  )::uuid;
$$;

create temporary table _demo_users (
  id uuid primary key,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('customer', 'farmer')),
  password text not null default 'DemoPass123!'
) on commit drop;

create temporary table _demo_farmers (
  sort_order integer primary key,
  user_id uuid not null unique references _demo_users (id) on update cascade,
  farm_profile_id uuid not null unique,
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

create temporary table _demo_produce (
  sort_order integer primary key,
  produce_id text not null,
  produce_name text not null,
  unit text not null,
  base_price numeric not null
) on commit drop;

insert into _demo_users (id, email, full_name, role)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'customer-demo@demo.com', 'Customer Demo', 'customer'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'farmer-demo@demo.com', 'Farmer Demo', 'farmer'),
  ('c0000001-0000-4000-8000-000000000001', 'kristiansand.farm@example.com', 'Kristiansand Market Farm', 'farmer'),
  ('c0000002-0000-4000-8000-000000000002', 'grimstad.farm@example.com', 'Grimstad Herb Garden', 'farmer'),
  ('c0000003-0000-4000-8000-000000000003', 'arendal.farm@example.com', 'Arendal Apple Orchard', 'farmer'),
  ('c0000004-0000-4000-8000-000000000004', 'lillesand.farm@example.com', 'Lillesand Roots', 'farmer'),
  ('c0000005-0000-4000-8000-000000000005', 'mandal.farm@example.com', 'Mandal Berry Collective', 'farmer'),
  ('c0000006-0000-4000-8000-000000000006', 'bergen.farm@example.com', 'Bergen Berry Farm', 'farmer'),
  ('c0000007-0000-4000-8000-000000000007', 'oslo.farm@example.com', 'Oslo Urban Growers', 'farmer'),
  ('c0000008-0000-4000-8000-000000000008', 'trondheim.farm@example.com', 'Trondheim Fjord Farm', 'farmer'),
  ('c0000009-0000-4000-8000-000000000009', 'stavanger.farm@example.com', 'Stavanger Greenhouse', 'farmer'),
  ('c0000010-0000-4000-8000-000000000010', 'tromso.farm@example.com', 'Tromso Arctic Greens', 'farmer'),
  ('c0000011-0000-4000-8000-000000000011', 'voss.farm@example.com', 'Voss Mountain Dairy', 'farmer'),
  ('c0000012-0000-4000-8000-000000000012', 'halden.farm@example.com', 'Halden River Farm', 'farmer'),
  ('c0000013-0000-4000-8000-000000000013', 'tonsberg.farm@example.com', 'Tonsberg Coastal Garden', 'farmer'),
  ('c0000014-0000-4000-8000-000000000014', 'larvik.farm@example.com', 'Larvik Orchard House', 'farmer'),
  ('c0000015-0000-4000-8000-000000000015', 'skien.farm@example.com', 'Skien Valley Farm', 'farmer'),
  ('c0000016-0000-4000-8000-000000000016', 'drammen.farm@example.com', 'Drammen Hillside Growers', 'farmer'),
  ('c0000017-0000-4000-8000-000000000017', 'horten.farm@example.com', 'Horten Market Garden', 'farmer'),
  ('c0000018-0000-4000-8000-000000000018', 'molde.farm@example.com', 'Molde Fjord Produce', 'farmer'),
  ('c0000019-0000-4000-8000-000000000019', 'alesund.farm@example.com', 'Alesund Island Farm', 'farmer'),
  ('c0000020-0000-4000-8000-000000000020', 'bodo.farm@example.com', 'Bodo Northlight Farm', 'farmer'),
  ('c0000021-0000-4000-8000-000000000021', 'alta.farm@example.com', 'Alta Plateau Farm', 'farmer'),
  ('c0000022-0000-4000-8000-000000000022', 'lillehammer.farm@example.com', 'Lillehammer Valley Growers', 'farmer'),
  ('c0000023-0000-4000-8000-000000000023', 'gjovik.farm@example.com', 'Gjovik Lake Farm', 'farmer'),
  ('c0000024-0000-4000-8000-000000000024', 'sarpsborg.farm@example.com', 'Sarpsborg Harvest Farm', 'farmer'),
  ('c0000025-0000-4000-8000-000000000025', 'fredrikstad.farm@example.com', 'Fredrikstad Market Fields', 'farmer'),
  ('c0000026-0000-4000-8000-000000000026', 'moss.farm@example.com', 'Moss Green Basket', 'farmer'),
  ('c0000027-0000-4000-8000-000000000027', 'kongsberg.farm@example.com', 'Kongsberg Valley Produce', 'farmer'),
  ('c0000028-0000-4000-8000-000000000028', 'hamar.farm@example.com', 'Hamar Lake Garden', 'farmer'),
  ('c0000029-0000-4000-8000-000000000029', 'elverum.farm@example.com', 'Elverum Forest Farm', 'farmer'),
  ('c0000030-0000-4000-8000-000000000030', 'harstad.farm@example.com', 'Harstad Harbor Farm', 'farmer'),
  ('c0000031-0000-4000-8000-000000000031', 'narvik.farm@example.com', 'Narvik Mountain Greens', 'farmer'),
  ('c0000032-0000-4000-8000-000000000032', 'steinkjer.farm@example.com', 'Steinkjer Harvest House', 'farmer'),
  ('c0000033-0000-4000-8000-000000000033', 'haugesund.farm@example.com', 'Haugesund Coastal Produce', 'farmer'),
  ('c0000034-0000-4000-8000-000000000034', 'kristiansund.farm@example.com', 'Kristiansund Island Dairy', 'farmer');

insert into _demo_farmers (
  sort_order,
  user_id,
  farm_profile_id,
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
  (1, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'd0000001-0000-4000-8000-000000000001', 'Demo Market Farm', 'Primary demo farm with a complete stock, market, pickup, and order history setup.', 'Kristiansand', 'Agder', 'Kristiansand', '4610', 'Markens gate 1', 58.1467, 7.9956),
  (2, 'c0000001-0000-4000-8000-000000000001', 'd0000002-0000-4000-8000-000000000002', 'Kristiansand Market Farm', 'Vegetables and berries near the default map center.', 'Kristiansand', 'Agder', 'Kristiansand', '4610', 'Strandgata 12', 58.1580, 7.9830),
  (3, 'c0000002-0000-4000-8000-000000000002', 'd0000003-0000-4000-8000-000000000003', 'Grimstad Herb Garden', 'Small herb garden with fresh greens and pickup baskets.', 'Grimstad', 'Agder', 'Grimstad', '4878', 'Torggata 5', 58.3405, 8.5934),
  (4, 'c0000003-0000-4000-8000-000000000003', 'd0000004-0000-4000-8000-000000000004', 'Arendal Apple Orchard', 'Apple orchard with seasonal fruit and market stalls.', 'Arendal', 'Agder', 'Arendal', '4836', 'Havneveien 20', 58.4615, 8.7725),
  (5, 'c0000004-0000-4000-8000-000000000004', 'd0000005-0000-4000-8000-000000000005', 'Lillesand Roots', 'Root vegetables, cabbage, and simple weekly pickup windows.', 'Lillesand', 'Agder', 'Lillesand', '4790', 'Strandveien 8', 58.2413, 8.0836),
  (6, 'c0000005-0000-4000-8000-000000000005', 'd0000006-0000-4000-8000-000000000006', 'Mandal Berry Collective', 'Berry collective with summer fruit, honey, and eggs.', 'Mandal', 'Agder', 'Mandal', '4515', 'Kirkeveien 3', 58.0274, 7.4534),
  (7, 'c0000006-0000-4000-8000-000000000006', 'd0000007-0000-4000-8000-000000000007', 'Bergen Berry Farm', 'Farther-away farm for map distance and search demos.', 'Bergen', 'Vestland', 'Bergen', '5003', 'Bryggen 4', 60.3913, 5.3221),
  (8, 'c0000007-0000-4000-8000-000000000007', 'd0000008-0000-4000-8000-000000000008', 'Oslo Urban Growers', 'Urban farm with greenhouse produce and office pickups.', 'Oslo', 'Oslo', 'Oslo', '0150', 'Dronningens gate 10', 59.9139, 10.7522),
  (9, 'c0000008-0000-4000-8000-000000000008', 'd0000009-0000-4000-8000-000000000009', 'Trondheim Fjord Farm', 'Fjord-side farm with dairy, vegetables, and market events.', 'Trondheim', 'Trondelag', 'Trondheim', '7010', 'Kongens gate 18', 63.4305, 10.3951),
  (10, 'c0000009-0000-4000-8000-000000000009', 'd0000010-0000-4000-8000-000000000010', 'Stavanger Greenhouse', 'Greenhouse farm with tomatoes, cucumbers, and herbs.', 'Stavanger', 'Rogaland', 'Stavanger', '4014', 'Pedersgata 25', 58.9700, 5.7331),
  (11, 'c0000010-0000-4000-8000-000000000010', 'd0000011-0000-4000-8000-000000000011', 'Tromso Arctic Greens', 'Northern demo farm with hardy greens and greenhouse stock.', 'Tromso', 'Troms', 'Tromso', '9008', 'Storgata 77', 69.6492, 18.9553),
  (12, 'c0000011-0000-4000-8000-000000000011', 'd0000012-0000-4000-8000-000000000012', 'Voss Mountain Dairy', 'Mountain dairy with eggs, cheese, berries, and vegetables.', 'Voss', 'Vestland', 'Voss', '5700', 'Uttragata 16', 60.6287, 6.4147),
  (13, 'c0000012-0000-4000-8000-000000000012', 'd0000013-0000-4000-8000-000000000013', 'Halden River Farm', 'Eastern Norway farm with market baskets and pantry goods.', 'Halden', 'Viken', 'Halden', '1767', 'Storgata 6', 59.1248, 11.3875),
  (14, 'c0000013-0000-4000-8000-000000000013', 'd0000014-0000-4000-8000-000000000014', 'Tonsberg Coastal Garden', 'Coastal garden with early greens, berries, and weekend market baskets.', 'Tonsberg', 'Vestfold og Telemark', 'Tonsberg', '3110', 'Nedre Langgate 18', 59.2675, 10.4076),
  (15, 'c0000014-0000-4000-8000-000000000014', 'd0000015-0000-4000-8000-000000000015', 'Larvik Orchard House', 'Fruit orchard with apples, plums, honey, and pickup crates.', 'Larvik', 'Vestfold og Telemark', 'Larvik', '3256', 'Kongegata 22', 59.0533, 10.0352),
  (16, 'c0000015-0000-4000-8000-000000000015', 'd0000016-0000-4000-8000-000000000016', 'Skien Valley Farm', 'Valley farm focused on root vegetables, cabbage, and pantry staples.', 'Skien', 'Vestfold og Telemark', 'Skien', '3717', 'Telemarksgata 14', 59.2096, 9.6090),
  (17, 'c0000016-0000-4000-8000-000000000016', 'd0000017-0000-4000-8000-000000000017', 'Drammen Hillside Growers', 'Hillside growers with greenhouse tomatoes, cucumbers, and herbs.', 'Drammen', 'Viken', 'Drammen', '3015', 'Nedre Storgate 10', 59.7440, 10.2045),
  (18, 'c0000017-0000-4000-8000-000000000017', 'd0000018-0000-4000-8000-000000000018', 'Horten Market Garden', 'Compact market garden serving weekly pickup boxes near the harbor.', 'Horten', 'Vestfold og Telemark', 'Horten', '3187', 'Storgata 35', 59.4172, 10.4834),
  (19, 'c0000018-0000-4000-8000-000000000018', 'd0000019-0000-4000-8000-000000000019', 'Molde Fjord Produce', 'Fjord farm with hardy greens, dairy products, and seasonal fruit.', 'Molde', 'More og Romsdal', 'Molde', '6413', 'Storgata 24', 62.7375, 7.1591),
  (20, 'c0000019-0000-4000-8000-000000000019', 'd0000020-0000-4000-8000-000000000020', 'Alesund Island Farm', 'Island farm with coastal herbs, eggs, berries, and market stalls.', 'Alesund', 'More og Romsdal', 'Alesund', '6002', 'Kongens gate 12', 62.4722, 6.1549),
  (21, 'c0000020-0000-4000-8000-000000000020', 'd0000021-0000-4000-8000-000000000021', 'Bodo Northlight Farm', 'Northern farm with greenhouse vegetables and cold-weather pickup windows.', 'Bodo', 'Nordland', 'Bodo', '8006', 'Storgata 8', 67.2804, 14.4050),
  (22, 'c0000021-0000-4000-8000-000000000021', 'd0000022-0000-4000-8000-000000000022', 'Alta Plateau Farm', 'Plateau farm with resilient greens, potatoes, berries, and honey.', 'Alta', 'Troms og Finnmark', 'Alta', '9510', 'Lokkegata 9', 69.9687, 23.2716),
  (23, 'c0000022-0000-4000-8000-000000000022', 'd0000023-0000-4000-8000-000000000023', 'Lillehammer Valley Growers', 'Valley growers with vegetables, apples, eggs, and farm pickup boxes.', 'Lillehammer', 'Innlandet', 'Lillehammer', '2609', 'Storgata 55', 61.1153, 10.4662),
  (24, 'c0000023-0000-4000-8000-000000000023', 'd0000024-0000-4000-8000-000000000024', 'Gjovik Lake Farm', 'Lake-side farm with fresh produce, dairy, and weekend reservations.', 'Gjovik', 'Innlandet', 'Gjovik', '2815', 'Hunnsvegen 3', 60.7957, 10.6916),
  (25, 'c0000024-0000-4000-8000-000000000024', 'd0000025-0000-4000-8000-000000000025', 'Sarpsborg Harvest Farm', 'Harvest farm with root vegetables, eggs, berries, and market pickup.', 'Sarpsborg', 'Viken', 'Sarpsborg', '1706', 'St. Marie gate 47', 59.2839, 11.1096),
  (26, 'c0000025-0000-4000-8000-000000000025', 'd0000026-0000-4000-8000-000000000026', 'Fredrikstad Market Fields', 'Market fields with greens, mushrooms, and family pickup boxes.', 'Fredrikstad', 'Viken', 'Fredrikstad', '1607', 'Nygaardsgata 32', 59.2205, 10.9347),
  (27, 'c0000026-0000-4000-8000-000000000026', 'd0000027-0000-4000-8000-000000000027', 'Moss Green Basket', 'Green basket farm with salad, radishes, herbs, and pantry bundles.', 'Moss', 'Viken', 'Moss', '1530', 'Dronningens gate 15', 59.4340, 10.6577),
  (28, 'c0000027-0000-4000-8000-000000000027', 'd0000028-0000-4000-8000-000000000028', 'Kongsberg Valley Produce', 'Valley farm with potatoes, leeks, fruit, and pickup subscriptions.', 'Kongsberg', 'Viken', 'Kongsberg', '3616', 'Storgata 12', 59.6686, 9.6502),
  (29, 'c0000028-0000-4000-8000-000000000028', 'd0000029-0000-4000-8000-000000000029', 'Hamar Lake Garden', 'Lake garden with greens, eggs, honey, and weekend market stalls.', 'Hamar', 'Innlandet', 'Hamar', '2317', 'Torggata 22', 60.7945, 11.0679),
  (30, 'c0000029-0000-4000-8000-000000000029', 'd0000030-0000-4000-8000-000000000030', 'Elverum Forest Farm', 'Forest farm with mushrooms, berries, and hardy vegetables.', 'Elverum', 'Innlandet', 'Elverum', '2408', 'Storgata 18', 60.8819, 11.5623),
  (31, 'c0000030-0000-4000-8000-000000000030', 'd0000031-0000-4000-8000-000000000031', 'Harstad Harbor Farm', 'Harbor farm with fresh greens, dairy, and reservation boxes.', 'Harstad', 'Troms', 'Harstad', '9405', 'Havnegata 4', 68.7986, 16.5415),
  (32, 'c0000031-0000-4000-8000-000000000031', 'd0000032-0000-4000-8000-000000000032', 'Narvik Mountain Greens', 'Mountain greenhouse with salad, kale, herbs, and cold-weather pickup.', 'Narvik', 'Nordland', 'Narvik', '8514', 'Kongens gate 42', 68.4385, 17.4273),
  (33, 'c0000032-0000-4000-8000-000000000032', 'd0000033-0000-4000-8000-000000000033', 'Steinkjer Harvest House', 'Harvest house with root vegetables, squash, dairy, and pickup crates.', 'Steinkjer', 'Trondelag', 'Steinkjer', '7713', 'Kongens gate 20', 64.0149, 11.4954),
  (34, 'c0000033-0000-4000-8000-000000000033', 'd0000034-0000-4000-8000-000000000034', 'Haugesund Coastal Produce', 'Coastal produce farm with greenhouse vegetables and fruit baskets.', 'Haugesund', 'Rogaland', 'Haugesund', '5527', 'Haraldsgata 90', 59.4138, 5.2680),
  (35, 'c0000034-0000-4000-8000-000000000034', 'd0000035-0000-4000-8000-000000000035', 'Kristiansund Island Dairy', 'Island dairy with milk, cheese, eggs, and reservation pickup.', 'Kristiansund', 'More og Romsdal', 'Kristiansund', '6509', 'Kaibakken 3', 63.1103, 7.7281);

insert into _demo_produce (sort_order, produce_id, produce_name, unit, base_price)
values
  (1, 'potet', 'Potet', 'kg', 20),
  (2, 'gulrot', 'Gulrot', 'kg', 25),
  (3, 'lok', 'Lok', 'kg', 22),
  (4, 'brokkoli', 'Brokkoli', 'stk', 35),
  (5, 'tomat', 'Tomat', 'kg', 45),
  (6, 'agurk', 'Agurk', 'stk', 20),
  (7, 'spinat', 'Spinat', 'pose', 30),
  (8, 'eple', 'Eple', 'kg', 40),
  (9, 'jordbaer', 'Jordbaer', 'kg', 60),
  (10, 'bringebaer', 'Bringebaer', 'kg', 70),
  (11, 'blabaer', 'Blabaer', 'kg', 70),
  (12, 'egg', 'Egg', 'pakke', 45),
  (13, 'helmelk', 'Helmelk', 'liter', 25),
  (14, 'smor', 'Smor', 'pakke', 48),
  (15, 'hvitost', 'Hvitost', 'kg', 85),
  (16, 'geitost', 'Geitost', 'kg', 95),
  (17, 'honning', 'Honning', 'glass', 120),
  (18, 'persille', 'Persille', 'bunt', 15),
  (19, 'dill', 'Dill', 'bunt', 15),
  (20, 'basilikum', 'Basilikum', 'potte', 22),
  (21, 'reddik', 'Reddik', 'bunt', 18),
  (22, 'salat', 'Salat', 'stk', 28),
  (23, 'gronnkal', 'Gronnkal', 'pose', 34),
  (24, 'rabarbra', 'Rabarbra', 'kg', 42),
  (25, 'plomme', 'Plomme', 'kg', 55),
  (26, 'purre', 'Purre', 'stk', 18),
  (27, 'squash', 'Squash', 'stk', 24),
  (28, 'hvitlok', 'Hvitlok', 'stk', 12);

-- Keep existing app data. If a previous demo seed already created auth users or
-- farm profiles for these demo emails, reuse their ids to avoid unique conflicts
-- and preserve related rows.
update _demo_users demo
set id = users.id
from auth.users users
where lower(users.email) = lower(demo.email);

update _demo_farmers demo
set farm_profile_id = farm_profiles.id
from public.farm_profiles farm_profiles
where farm_profiles.user_id = demo.user_id;

insert into auth.users (
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
  id,
  'authenticated',
  'authenticated',
  email,
  crypt(password, gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  jsonb_build_object('full_name', full_name, 'role', role),
  now(),
  now()
from _demo_users
where true
on conflict (id) do update
set email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = coalesce(auth.users.email_confirmed_at, excluded.email_confirmed_at),
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now();

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
from _demo_users
where true
on conflict (provider_id, provider) do update
set user_id = excluded.user_id,
    identity_data = excluded.identity_data,
    updated_at = now();

insert into public.profiles (
  id,
  email,
  full_name,
  role,
  display_name,
  phone_number,
  bio,
  location_label,
  preferred_contact_method,
  default_pickup_notes
)
select
  id,
  email,
  full_name,
  role,
  case when role = 'customer' then 'Customer Demo' else full_name end,
  case when role = 'customer' then '+47 400 00 100' else '+47 400 00 ' || lpad(row_number() over (order by email)::text, 3, '0') end,
  case
    when role = 'customer' then 'Demo customer account with order history, pickup notes, and reservations.'
    else 'Demo farmer account for FarmConnect walkthroughs.'
  end,
  case when role = 'customer' then 'Kristiansand, Norway' else null end,
  case when role = 'customer' then 'phone' else 'email' end,
  case when role = 'customer' then 'Call when the order is ready. Prefer pickup after 15:00.' else null end
from _demo_users
where true
on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      role = excluded.role,
      display_name = excluded.display_name,
      phone_number = excluded.phone_number,
      bio = excluded.bio,
      location_label = excluded.location_label,
      preferred_contact_method = excluded.preferred_contact_method,
      default_pickup_notes = excluded.default_pickup_notes;

insert into public.farm_profiles (
  id,
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
  farm_profile_id,
  user_id,
  farm_name,
  farm_bio,
  farm_location,
  'Norway',
  region,
  city,
  postal_code,
  street,
  latitude,
  longitude
from _demo_farmers
where true
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

insert into public.farm_produce (
  id,
  farm_id,
  produce_id,
  price,
  stock,
  unit,
  is_available,
  created_at,
  updated_at
)
select
  pg_temp.demo_uuid('farm-produce:' || f.farm_profile_id::text || ':' || p.produce_id),
  f.farm_profile_id,
  p.produce_id,
  p.base_price + ((f.sort_order + p.sort_order) % 4) * 2,
  case
    when f.sort_order = 1 then 30 + p.sort_order * 4
    when (f.sort_order + p.sort_order) % 9 = 0 then 4
    else 12 + ((f.sort_order * 11 + p.sort_order * 7) % 65)
  end,
  p.unit,
  (f.sort_order + p.sort_order) % 10 <> 0,
  now(),
  now()
from _demo_farmers f
join _demo_produce p
  on f.sort_order = 1
  or ((f.sort_order + p.sort_order) % 5 in (0, 1, 3, 4) and p.sort_order <= 24)
where true
on conflict (farm_id, produce_id) do update
set price = excluded.price,
    stock = excluded.stock,
    unit = excluded.unit,
    is_available = excluded.is_available,
    updated_at = now();

insert into public.market_days (
  id,
  farmer_id,
  date,
  start_time,
  end_time,
  location,
  notes,
  created_at,
  updated_at
)
select
  pg_temp.demo_uuid('market-day:' || f.user_id::text || ':' || m.slot_no::text),
  f.user_id,
  current_date + m.day_offset,
  m.start_time,
  m.end_time,
  m.location,
  m.notes,
  now(),
  now()
from _demo_farmers f
cross join (
  values
    (1, 1, '08:30'::time, '13:30'::time, 'Town market square', 'Fresh produce, eggs, and preorder pickup.'),
    (2, 3, '10:00'::time, '16:00'::time, 'Harbor market stall', 'Weekend stall with seasonal tasting baskets.'),
    (3, 7, '09:00'::time, '14:00'::time, 'Farm gate stand', 'Bring your own bag for pickup orders.'),
    (4, 12, '12:00'::time, '18:00'::time, 'Community food hall', 'Extended pickup window for reservations.')
) as m(slot_no, day_offset, start_time, end_time, location, notes)
where true
on conflict (id) do update
set farmer_id = excluded.farmer_id,
    date = excluded.date,
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    location = excluded.location,
    notes = excluded.notes,
    updated_at = now();

insert into public.pickup_inventory (
  id,
  farmer_id,
  produce_id,
  produce_name,
  available_quantity,
  unit,
  price_text,
  notes,
  is_available,
  created_at,
  updated_at
)
select
  pg_temp.demo_uuid('pickup-inventory:' || f.user_id::text || ':' || p.produce_id),
  f.user_id,
  p.produce_id,
  p.produce_name,
  8 + ((f.sort_order * 5 + p.sort_order * 3) % 42),
  p.unit,
  (p.base_price + ((f.sort_order + p.sort_order) % 3) * 3)::text || ' kr/' || p.unit,
  case
    when p.sort_order in (9, 10, 11) then 'Packed fresh for same-day pickup.'
    when p.sort_order in (12, 13, 14, 15, 16) then 'Keep chilled after pickup.'
    else 'Available from the farm stand this week.'
  end,
  true,
  now(),
  now()
from _demo_farmers f
join _demo_produce p
  on f.sort_order = 1
  or ((f.sort_order + p.sort_order) % 4 <> 2 and p.sort_order <= 18)
where true
on conflict (id) do update
set farmer_id = excluded.farmer_id,
    produce_id = excluded.produce_id,
    produce_name = excluded.produce_name,
    available_quantity = excluded.available_quantity,
    unit = excluded.unit,
    price_text = excluded.price_text,
    notes = excluded.notes,
    is_available = excluded.is_available,
    updated_at = now();

insert into public.pickup_time_slots (
  id,
  farmer_id,
  slot_date,
  start_time,
  end_time,
  capacity,
  location,
  notes,
  created_at,
  updated_at
)
select
  pg_temp.demo_uuid('pickup-slot:' || f.user_id::text || ':' || s.slot_no::text),
  f.user_id,
  current_date + s.day_offset,
  s.start_time,
  s.end_time,
  s.capacity,
  s.location,
  s.notes,
  now(),
  now()
from _demo_farmers f
cross join (
  values
    (1, 1, '09:00'::time, '11:00'::time, 8, 'Farm pickup shelf', 'Morning pickup. Orders are labelled by name.'),
    (2, 2, '15:00'::time, '18:00'::time, 12, 'Main farm gate', 'Afternoon pickup after harvest packing.'),
    (3, 5, '10:00'::time, '14:00'::time, 10, 'Market pickup point', 'Good for market-day reservations.'),
    (4, 8, '16:00'::time, '19:00'::time, 6, 'Community food hall', 'Late pickup window for commuters.')
) as s(slot_no, day_offset, start_time, end_time, capacity, location, notes)
where f.sort_order = 1 or s.slot_no <= 3
on conflict (id) do update
set farmer_id = excluded.farmer_id,
    slot_date = excluded.slot_date,
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    capacity = excluded.capacity,
    location = excluded.location,
    notes = excluded.notes,
    updated_at = now();

create temporary table _demo_orders (
  order_key text primary key,
  farmer_sort_order integer not null references _demo_farmers (sort_order),
  status text not null check (status in ('pending', 'confirmed', 'cancelled')),
  delivery_method text not null check (delivery_method in ('pickup', 'reservation')),
  pickup_notes text,
  days_ago integer not null,
  expires_in_days integer
) on commit drop;

create temporary table _demo_order_items (
  order_key text not null references _demo_orders (order_key),
  line_no integer not null,
  produce_name text not null,
  qty numeric not null,
  unit text not null,
  unit_price numeric not null,
  primary key (order_key, line_no)
) on commit drop;

insert into _demo_orders (
  order_key,
  farmer_sort_order,
  status,
  delivery_method,
  pickup_notes,
  days_ago,
  expires_in_days
)
values
  ('order-001', 1, 'confirmed', 'pickup', 'Pick up after 15:00. Call when ready.', 1, null),
  ('order-002', 1, 'pending', 'pickup', 'Customer will bring their own bag.', 2, null),
  ('order-003', 1, 'pending', 'reservation', 'Reserved for the weekend pickup window.', 0, 2),
  ('order-004', 1, 'cancelled', 'pickup', 'Cancelled by customer before packing.', 9, null),
  ('order-005', 2, 'confirmed', 'pickup', 'Pickup from town market stall.', 4, null),
  ('order-006', 3, 'confirmed', 'reservation', 'Herb bundle reserved for dinner service.', 5, 1),
  ('order-007', 4, 'confirmed', 'pickup', 'Fruit basket for office lunch.', 7, null),
  ('order-008', 5, 'pending', 'pickup', 'Customer asked for root vegetables only.', 3, null),
  ('order-009', 6, 'confirmed', 'pickup', 'Berry crates for a birthday party.', 6, null),
  ('order-010', 7, 'confirmed', 'reservation', 'Reserve chilled goods until Friday.', 8, 3),
  ('order-011', 8, 'confirmed', 'pickup', 'Office pickup order.', 10, null),
  ('order-012', 9, 'confirmed', 'pickup', 'Dairy and vegetable bundle.', 12, null),
  ('order-013', 10, 'pending', 'pickup', 'Greenhouse vegetables for dinner.', 1, null),
  ('order-014', 11, 'confirmed', 'reservation', 'Arctic greens reserved for testing.', 14, 2),
  ('order-015', 12, 'confirmed', 'pickup', 'Cheese, eggs, and honey.', 16, null),
  ('order-016', 13, 'cancelled', 'pickup', 'Duplicate order from customer.', 18, null),
  ('order-017', 2, 'confirmed', 'pickup', 'Repeat market order.', 20, null),
  ('order-018', 3, 'pending', 'pickup', 'Waiting for harvest confirmation.', 0, null),
  ('order-019', 4, 'confirmed', 'pickup', 'Apple and berry mix.', 22, null),
  ('order-020', 6, 'confirmed', 'reservation', 'Hold berry basket for pickup.', 2, 4),
  ('order-021', 14, 'confirmed', 'pickup', 'Coastal greens and berries for family dinner.', 11, null),
  ('order-022', 15, 'pending', 'pickup', 'Fruit box for office kitchen.', 0, null),
  ('order-023', 16, 'confirmed', 'reservation', 'Reserve root vegetable crate until market day.', 4, 3),
  ('order-024', 17, 'confirmed', 'pickup', 'Tomato and cucumber bundle.', 6, null),
  ('order-025', 18, 'pending', 'pickup', 'Small weekly pickup basket.', 1, null),
  ('order-026', 19, 'confirmed', 'pickup', 'Fjord produce and dairy order.', 13, null),
  ('order-027', 20, 'confirmed', 'reservation', 'Hold herb and egg basket.', 7, 2),
  ('order-028', 21, 'confirmed', 'pickup', 'Northern greenhouse vegetables.', 9, null),
  ('order-029', 22, 'pending', 'reservation', 'Plateau farm weekend reservation.', 0, 5),
  ('order-030', 23, 'confirmed', 'pickup', 'Lake valley mixed crate.', 15, null),
  ('order-031', 24, 'confirmed', 'pickup', 'Customer requested extra honey.', 19, null),
  ('order-032', 25, 'cancelled', 'pickup', 'Customer moved pickup to next week.', 21, null),
  ('order-033', 26, 'confirmed', 'pickup', 'Market field salad and mushroom basket.', 2, null),
  ('order-034', 30, 'confirmed', 'reservation', 'Forest farm berry reservation.', 5, 4),
  ('order-035', 35, 'pending', 'pickup', 'Island dairy sampler.', 0, null);

insert into _demo_order_items (order_key, line_no, produce_name, qty, unit, unit_price)
values
  ('order-001', 1, 'Potet', 3, 'kg', 20),
  ('order-001', 2, 'Gulrot', 2, 'kg', 25),
  ('order-001', 3, 'Egg', 1, 'pakke', 45),
  ('order-002', 1, 'Brokkoli', 2, 'stk', 35),
  ('order-002', 2, 'Tomat', 1.5, 'kg', 45),
  ('order-002', 3, 'Persille', 2, 'bunt', 15),
  ('order-003', 1, 'Jordbaer', 2, 'kg', 60),
  ('order-003', 2, 'Honning', 1, 'glass', 120),
  ('order-004', 1, 'Agurk', 3, 'stk', 20),
  ('order-004', 2, 'Spinat', 1, 'pose', 30),
  ('order-005', 1, 'Potet', 5, 'kg', 20),
  ('order-005', 2, 'Gulrot', 4, 'kg', 25),
  ('order-005', 3, 'Lok', 2, 'kg', 22),
  ('order-006', 1, 'Dill', 2, 'bunt', 15),
  ('order-006', 2, 'Basilikum', 2, 'potte', 22),
  ('order-006', 3, 'Persille', 2, 'bunt', 15),
  ('order-007', 1, 'Eple', 4, 'kg', 40),
  ('order-007', 2, 'Blabaer', 1.5, 'kg', 70),
  ('order-008', 1, 'Potet', 4, 'kg', 20),
  ('order-008', 2, 'Gulrot', 3, 'kg', 25),
  ('order-008', 3, 'Brokkoli', 2, 'stk', 35),
  ('order-009', 1, 'Jordbaer', 3, 'kg', 60),
  ('order-009', 2, 'Bringebaer', 2, 'kg', 70),
  ('order-009', 3, 'Blabaer', 2, 'kg', 70),
  ('order-010', 1, 'Smor', 2, 'pakke', 48),
  ('order-010', 2, 'Hvitost', 1, 'kg', 85),
  ('order-010', 3, 'Egg', 2, 'pakke', 45),
  ('order-011', 1, 'Tomat', 3, 'kg', 45),
  ('order-011', 2, 'Agurk', 4, 'stk', 20),
  ('order-011', 3, 'Spinat', 3, 'pose', 30),
  ('order-012', 1, 'Helmelk', 4, 'liter', 25),
  ('order-012', 2, 'Hvitost', 1.5, 'kg', 85),
  ('order-012', 3, 'Potet', 3, 'kg', 20),
  ('order-013', 1, 'Tomat', 2, 'kg', 45),
  ('order-013', 2, 'Basilikum', 1, 'potte', 22),
  ('order-013', 3, 'Agurk', 3, 'stk', 20),
  ('order-014', 1, 'Spinat', 4, 'pose', 30),
  ('order-014', 2, 'Dill', 2, 'bunt', 15),
  ('order-015', 1, 'Geitost', 1, 'kg', 95),
  ('order-015', 2, 'Egg', 2, 'pakke', 45),
  ('order-015', 3, 'Honning', 1, 'glass', 120),
  ('order-016', 1, 'Potet', 2, 'kg', 20),
  ('order-016', 2, 'Lok', 2, 'kg', 22),
  ('order-017', 1, 'Gulrot', 4, 'kg', 25),
  ('order-017', 2, 'Brokkoli', 2, 'stk', 35),
  ('order-017', 3, 'Egg', 1, 'pakke', 45),
  ('order-018', 1, 'Persille', 3, 'bunt', 15),
  ('order-018', 2, 'Dill', 2, 'bunt', 15),
  ('order-019', 1, 'Eple', 3, 'kg', 40),
  ('order-019', 2, 'Bringebaer', 1.5, 'kg', 70),
  ('order-019', 3, 'Honning', 1, 'glass', 120),
  ('order-020', 1, 'Jordbaer', 2, 'kg', 60),
  ('order-020', 2, 'Blabaer', 1, 'kg', 70),
  ('order-021', 1, 'Salat', 2, 'stk', 28),
  ('order-021', 2, 'Reddik', 3, 'bunt', 18),
  ('order-021', 3, 'Jordbaer', 1.5, 'kg', 60),
  ('order-022', 1, 'Plomme', 3, 'kg', 55),
  ('order-022', 2, 'Eple', 4, 'kg', 40),
  ('order-023', 1, 'Potet', 6, 'kg', 20),
  ('order-023', 2, 'Purre', 4, 'stk', 18),
  ('order-023', 3, 'Gulrot', 5, 'kg', 25),
  ('order-024', 1, 'Tomat', 4, 'kg', 45),
  ('order-024', 2, 'Agurk', 5, 'stk', 20),
  ('order-024', 3, 'Basilikum', 2, 'potte', 22),
  ('order-025', 1, 'Salat', 1, 'stk', 28),
  ('order-025', 2, 'Egg', 1, 'pakke', 45),
  ('order-026', 1, 'Helmelk', 3, 'liter', 25),
  ('order-026', 2, 'Gronnkal', 2, 'pose', 34),
  ('order-026', 3, 'Hvitost', 1, 'kg', 85),
  ('order-027', 1, 'Persille', 2, 'bunt', 15),
  ('order-027', 2, 'Dill', 2, 'bunt', 15),
  ('order-027', 3, 'Egg', 2, 'pakke', 45),
  ('order-028', 1, 'Gronnkal', 3, 'pose', 34),
  ('order-028', 2, 'Salat', 2, 'stk', 28),
  ('order-028', 3, 'Squash', 3, 'stk', 24),
  ('order-029', 1, 'Potet', 5, 'kg', 20),
  ('order-029', 2, 'Rabarbra', 2, 'kg', 42),
  ('order-029', 3, 'Honning', 1, 'glass', 120),
  ('order-030', 1, 'Eple', 3, 'kg', 40),
  ('order-030', 2, 'Blabaer', 2, 'kg', 70),
  ('order-030', 3, 'Purre', 3, 'stk', 18),
  ('order-031', 1, 'Honning', 2, 'glass', 120),
  ('order-031', 2, 'Egg', 2, 'pakke', 45),
  ('order-031', 3, 'Reddik', 2, 'bunt', 18),
  ('order-032', 1, 'Potet', 4, 'kg', 20),
  ('order-032', 2, 'Gulrot', 4, 'kg', 25),
  ('order-033', 1, 'Salat', 3, 'stk', 28),
  ('order-033', 2, 'Reddik', 2, 'bunt', 18),
  ('order-033', 3, 'Hvitlok', 6, 'stk', 12),
  ('order-034', 1, 'Bringebaer', 2, 'kg', 70),
  ('order-034', 2, 'Blabaer', 2, 'kg', 70),
  ('order-034', 3, 'Rabarbra', 1.5, 'kg', 42),
  ('order-035', 1, 'Helmelk', 4, 'liter', 25),
  ('order-035', 2, 'Smor', 2, 'pakke', 48),
  ('order-035', 3, 'Geitost', 1, 'kg', 95);

insert into public.orders (
  id,
  customer_id,
  farm_id,
  status,
  delivery_method,
  pickup_notes,
  total_price,
  created_at,
  updated_at,
  expires_at
)
select
  pg_temp.demo_uuid('order:' || o.order_key),
  customer.id,
  f.user_id,
  o.status,
  o.delivery_method,
  o.pickup_notes,
  totals.total_price,
  date_trunc('day', now()) - (o.days_ago * interval '1 day') + interval '10 hours',
  date_trunc('day', now()) - (o.days_ago * interval '1 day') + interval '11 hours',
  case
    when o.delivery_method = 'reservation' and o.expires_in_days is not null
      then date_trunc('day', now()) + (o.expires_in_days * interval '1 day') + interval '18 hours'
    else null
  end
from _demo_orders o
join _demo_farmers f on f.sort_order = o.farmer_sort_order
cross join (
  select id from _demo_users where email = 'customer-demo@demo.com'
) customer
join (
  select order_key, sum(qty * unit_price) as total_price
  from _demo_order_items
  group by order_key
) totals on totals.order_key = o.order_key
where true
on conflict (id) do update
set customer_id = excluded.customer_id,
    farm_id = excluded.farm_id,
    status = excluded.status,
    delivery_method = excluded.delivery_method,
    pickup_notes = excluded.pickup_notes,
    total_price = excluded.total_price,
    created_at = excluded.created_at,
    updated_at = excluded.updated_at,
    expires_at = excluded.expires_at;

insert into public.order_items (
  id,
  order_id,
  produce_name,
  qty,
  unit,
  price
)
select
  pg_temp.demo_uuid('order-item:' || i.order_key || ':' || i.line_no::text),
  pg_temp.demo_uuid('order:' || i.order_key),
  i.produce_name,
  i.qty,
  i.unit,
  i.qty * i.unit_price
from _demo_order_items i
where true
on conflict (id) do update
set order_id = excluded.order_id,
    produce_name = excluded.produce_name,
    qty = excluded.qty,
    unit = excluded.unit,
    price = excluded.price;

insert into public.push_tokens (id, user_id, token, created_at)
select
  pg_temp.demo_uuid('push-token:' || id::text),
  id,
  'ExponentPushToken[demo-' || replace(id::text, '-', '') || ']',
  now()
from _demo_users
where true
on conflict (user_id) do update
set token = excluded.token;
