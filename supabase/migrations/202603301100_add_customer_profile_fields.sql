alter table public.profiles
add column if not exists display_name text,
add column if not exists phone_number text,
add column if not exists bio text,
add column if not exists location_label text,
add column if not exists preferred_contact_method text not null default 'email'
  check (preferred_contact_method in ('email', 'phone')),
add column if not exists default_pickup_notes text;

update public.profiles
set display_name = coalesce(display_name, full_name)
where display_name is null;
