create extension if not exists "wrappers" with schema "extensions";

drop policy "market_days_select_own" on "public"."market_days";

alter table "public"."market_days" drop constraint "market_days_check";

alter table "public"."market_days" drop constraint "market_days_farmer_id_fkey";


  create table "public"."farm_produce" (
    "id" uuid not null default gen_random_uuid(),
    "farm_id" uuid not null,
    "produce_id" text not null,
    "price" numeric not null,
    "stock" numeric not null default 0,
    "unit" text not null,
    "is_available" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."farm_produce" enable row level security;


  create table "public"."farm_profiles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null default auth.uid(),
    "farm_name" text not null,
    "farm_bio" text,
    "farm_location" text,
    "farm_profile_picture_url" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "latitude" numeric,
    "longitude" numeric,
    "country" text,
    "region" text,
    "city" text,
    "postal_code" text,
    "street" text
      );


alter table "public"."farm_profiles" enable row level security;


  create table "public"."image_uploads_development" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "image_url" text not null,
    "image_path" text not null
      );


alter table "public"."image_uploads_development" enable row level security;


  create table "public"."order_items" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid not null,
    "produce_name" text not null,
    "qty" numeric not null,
    "unit" text not null,
    "price" numeric not null
      );


alter table "public"."order_items" enable row level security;


  create table "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "customer_id" uuid not null,
    "farm_id" uuid not null,
    "status" text not null,
    "delivery_method" text not null,
    "pickup_notes" text,
    "total_price" numeric not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "expires_at" timestamp with time zone
      );


alter table "public"."orders" enable row level security;


  create table "public"."push_tokens" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "token" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."push_tokens" enable row level security;

alter table "public"."market_days" alter column "created_at" set default now();

alter table "public"."market_days" alter column "farmer_id" set default gen_random_uuid();

alter table "public"."market_days" alter column "updated_at" set default now();

CREATE UNIQUE INDEX farm_produce_pkey ON public.farm_produce USING btree (id);

CREATE UNIQUE INDEX farm_produce_unique ON public.farm_produce USING btree (farm_id, produce_id);

CREATE UNIQUE INDEX farm_profile_user_id_key ON public.farm_profiles USING btree (user_id);

CREATE UNIQUE INDEX farm_profiles_pkey ON public.farm_profiles USING btree (id);

CREATE UNIQUE INDEX image_uploads_development_pkey ON public.image_uploads_development USING btree (id);

CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX push_tokens_pkey ON public.push_tokens USING btree (id);

CREATE UNIQUE INDEX push_tokens_user_id_key ON public.push_tokens USING btree (user_id);

alter table "public"."farm_produce" add constraint "farm_produce_pkey" PRIMARY KEY using index "farm_produce_pkey";

alter table "public"."farm_profiles" add constraint "farm_profiles_pkey" PRIMARY KEY using index "farm_profiles_pkey";

alter table "public"."image_uploads_development" add constraint "image_uploads_development_pkey" PRIMARY KEY using index "image_uploads_development_pkey";

alter table "public"."order_items" add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."push_tokens" add constraint "push_tokens_pkey" PRIMARY KEY using index "push_tokens_pkey";

alter table "public"."farm_produce" add constraint "farm_produce_farm_id_fkey" FOREIGN KEY (farm_id) REFERENCES public.farm_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."farm_produce" validate constraint "farm_produce_farm_id_fkey";

alter table "public"."farm_produce" add constraint "farm_produce_unique" UNIQUE using index "farm_produce_unique";

alter table "public"."farm_profiles" add constraint "farm_profile_user_id_key" UNIQUE using index "farm_profile_user_id_key";

alter table "public"."farm_profiles" add constraint "farm_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."farm_profiles" validate constraint "farm_profiles_user_id_fkey";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."orders" add constraint "orders_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.profiles(id) not valid;

alter table "public"."orders" validate constraint "orders_customer_id_fkey";

alter table "public"."orders" add constraint "orders_farm_id_fkey" FOREIGN KEY (farm_id) REFERENCES public.profiles(id) not valid;

alter table "public"."orders" validate constraint "orders_farm_id_fkey";

alter table "public"."push_tokens" add constraint "push_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."push_tokens" validate constraint "push_tokens_user_id_fkey";

alter table "public"."push_tokens" add constraint "push_tokens_user_id_key" UNIQUE using index "push_tokens_user_id_key";

alter table "public"."market_days" add constraint "market_days_farmer_id_fkey" FOREIGN KEY (farmer_id) REFERENCES public.profiles(id) not valid;

alter table "public"."market_days" validate constraint "market_days_farmer_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    case
      when new.raw_user_meta_data ->> 'role' = 'farmer' then 'farmer'
      else 'customer'
    end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        role = excluded.role,
        updated_at = timezone('utc', now());

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_profile_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$function$
;

grant delete on table "public"."farm_produce" to "anon";

grant insert on table "public"."farm_produce" to "anon";

grant references on table "public"."farm_produce" to "anon";

grant select on table "public"."farm_produce" to "anon";

grant trigger on table "public"."farm_produce" to "anon";

grant truncate on table "public"."farm_produce" to "anon";

grant update on table "public"."farm_produce" to "anon";

grant delete on table "public"."farm_produce" to "authenticated";

grant insert on table "public"."farm_produce" to "authenticated";

grant references on table "public"."farm_produce" to "authenticated";

grant select on table "public"."farm_produce" to "authenticated";

grant trigger on table "public"."farm_produce" to "authenticated";

grant truncate on table "public"."farm_produce" to "authenticated";

grant update on table "public"."farm_produce" to "authenticated";

grant delete on table "public"."farm_produce" to "service_role";

grant insert on table "public"."farm_produce" to "service_role";

grant references on table "public"."farm_produce" to "service_role";

grant select on table "public"."farm_produce" to "service_role";

grant trigger on table "public"."farm_produce" to "service_role";

grant truncate on table "public"."farm_produce" to "service_role";

grant update on table "public"."farm_produce" to "service_role";

grant delete on table "public"."farm_profiles" to "anon";

grant insert on table "public"."farm_profiles" to "anon";

grant references on table "public"."farm_profiles" to "anon";

grant select on table "public"."farm_profiles" to "anon";

grant trigger on table "public"."farm_profiles" to "anon";

grant truncate on table "public"."farm_profiles" to "anon";

grant update on table "public"."farm_profiles" to "anon";

grant delete on table "public"."farm_profiles" to "authenticated";

grant insert on table "public"."farm_profiles" to "authenticated";

grant references on table "public"."farm_profiles" to "authenticated";

grant select on table "public"."farm_profiles" to "authenticated";

grant trigger on table "public"."farm_profiles" to "authenticated";

grant truncate on table "public"."farm_profiles" to "authenticated";

grant update on table "public"."farm_profiles" to "authenticated";

grant delete on table "public"."farm_profiles" to "service_role";

grant insert on table "public"."farm_profiles" to "service_role";

grant references on table "public"."farm_profiles" to "service_role";

grant select on table "public"."farm_profiles" to "service_role";

grant trigger on table "public"."farm_profiles" to "service_role";

grant truncate on table "public"."farm_profiles" to "service_role";

grant update on table "public"."farm_profiles" to "service_role";

grant delete on table "public"."image_uploads_development" to "anon";

grant insert on table "public"."image_uploads_development" to "anon";

grant references on table "public"."image_uploads_development" to "anon";

grant select on table "public"."image_uploads_development" to "anon";

grant trigger on table "public"."image_uploads_development" to "anon";

grant truncate on table "public"."image_uploads_development" to "anon";

grant update on table "public"."image_uploads_development" to "anon";

grant delete on table "public"."image_uploads_development" to "authenticated";

grant insert on table "public"."image_uploads_development" to "authenticated";

grant references on table "public"."image_uploads_development" to "authenticated";

grant select on table "public"."image_uploads_development" to "authenticated";

grant trigger on table "public"."image_uploads_development" to "authenticated";

grant truncate on table "public"."image_uploads_development" to "authenticated";

grant update on table "public"."image_uploads_development" to "authenticated";

grant delete on table "public"."image_uploads_development" to "service_role";

grant insert on table "public"."image_uploads_development" to "service_role";

grant references on table "public"."image_uploads_development" to "service_role";

grant select on table "public"."image_uploads_development" to "service_role";

grant trigger on table "public"."image_uploads_development" to "service_role";

grant truncate on table "public"."image_uploads_development" to "service_role";

grant update on table "public"."image_uploads_development" to "service_role";

grant delete on table "public"."order_items" to "anon";

grant insert on table "public"."order_items" to "anon";

grant references on table "public"."order_items" to "anon";

grant select on table "public"."order_items" to "anon";

grant trigger on table "public"."order_items" to "anon";

grant truncate on table "public"."order_items" to "anon";

grant update on table "public"."order_items" to "anon";

grant delete on table "public"."order_items" to "authenticated";

grant insert on table "public"."order_items" to "authenticated";

grant references on table "public"."order_items" to "authenticated";

grant select on table "public"."order_items" to "authenticated";

grant trigger on table "public"."order_items" to "authenticated";

grant truncate on table "public"."order_items" to "authenticated";

grant update on table "public"."order_items" to "authenticated";

grant delete on table "public"."order_items" to "service_role";

grant insert on table "public"."order_items" to "service_role";

grant references on table "public"."order_items" to "service_role";

grant select on table "public"."order_items" to "service_role";

grant trigger on table "public"."order_items" to "service_role";

grant truncate on table "public"."order_items" to "service_role";

grant update on table "public"."order_items" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."push_tokens" to "anon";

grant insert on table "public"."push_tokens" to "anon";

grant references on table "public"."push_tokens" to "anon";

grant select on table "public"."push_tokens" to "anon";

grant trigger on table "public"."push_tokens" to "anon";

grant truncate on table "public"."push_tokens" to "anon";

grant update on table "public"."push_tokens" to "anon";

grant delete on table "public"."push_tokens" to "authenticated";

grant insert on table "public"."push_tokens" to "authenticated";

grant references on table "public"."push_tokens" to "authenticated";

grant select on table "public"."push_tokens" to "authenticated";

grant trigger on table "public"."push_tokens" to "authenticated";

grant truncate on table "public"."push_tokens" to "authenticated";

grant update on table "public"."push_tokens" to "authenticated";

grant delete on table "public"."push_tokens" to "service_role";

grant insert on table "public"."push_tokens" to "service_role";

grant references on table "public"."push_tokens" to "service_role";

grant select on table "public"."push_tokens" to "service_role";

grant trigger on table "public"."push_tokens" to "service_role";

grant truncate on table "public"."push_tokens" to "service_role";

grant update on table "public"."push_tokens" to "service_role";


  create policy "Anyone can view available farm produce"
  on "public"."farm_produce"
  as permissive
  for select
  to authenticated
using ((is_available = true));



  create policy "Farmers can manage their own produce"
  on "public"."farm_produce"
  as permissive
  for all
  to authenticated
using ((farm_id IN ( SELECT farm_profiles.id
   FROM public.farm_profiles
  WHERE (farm_profiles.user_id = auth.uid()))))
with check ((farm_id IN ( SELECT farm_profiles.id
   FROM public.farm_profiles
  WHERE (farm_profiles.user_id = auth.uid()))));



  create policy "anyone can view farm profiles"
  on "public"."farm_profiles"
  as permissive
  for select
  to authenticated
using (true);



  create policy "farmers can create their own farm profile"
  on "public"."farm_profiles"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "farmers can delete their own farm profile"
  on "public"."farm_profiles"
  as permissive
  for delete
  to authenticated
using ((auth.uid() = user_id));



  create policy "farmers can update their own farm profile"
  on "public"."farm_profiles"
  as permissive
  for update
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Enable create for all users"
  on "public"."image_uploads_development"
  as permissive
  for insert
  to public
with check (true);



  create policy "Enable delete for all users"
  on "public"."image_uploads_development"
  as permissive
  for delete
  to public
using (true);



  create policy "Enable edit for all users"
  on "public"."image_uploads_development"
  as permissive
  for update
  to public
using (true)
with check (true);



  create policy "Enable read access for all users"
  on "public"."image_uploads_development"
  as permissive
  for select
  to public
using (true);



  create policy "Enable delete for users based on user_id"
  on "public"."market_days"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = farmer_id));



  create policy "Enable insert for users based on user_id"
  on "public"."market_days"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = farmer_id));



  create policy "Enable users to view their own data only"
  on "public"."market_days"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = farmer_id));



  create policy "Farmers can update their market days"
  on "public"."market_days"
  as permissive
  for update
  to authenticated
using ((auth.uid() = farmer_id))
with check ((auth.uid() = farmer_id));



  create policy "market_days_select_profile_read"
  on "public"."market_days"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "order_items_insert_own"
  on "public"."order_items"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.customer_id = auth.uid())))));



  create policy "order_items_select_own"
  on "public"."order_items"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND ((orders.customer_id = auth.uid()) OR (orders.farm_id = auth.uid()))))));



  create policy "orders_insert_own"
  on "public"."orders"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = customer_id));



  create policy "orders_select_own"
  on "public"."orders"
  as permissive
  for select
  to authenticated
using (((auth.uid() = customer_id) OR (auth.uid() = farm_id)));



  create policy "orders_update_customer"
  on "public"."orders"
  as permissive
  for update
  to authenticated
using ((auth.uid() = customer_id))
with check ((auth.uid() = customer_id));



  create policy "orders_update_farmer"
  on "public"."orders"
  as permissive
  for update
  to authenticated
using ((auth.uid() = farm_id))
with check ((auth.uid() = farm_id));



  create policy "pickup_inventory_select_profile_read"
  on "public"."pickup_inventory"
  as permissive
  for select
  to anon, authenticated
using (((is_available = true) AND (available_quantity > (0)::numeric)));



  create policy "pickup_time_slots_select_profile_read"
  on "public"."pickup_time_slots"
  as permissive
  for select
  to anon, authenticated
using ((slot_date >= CURRENT_DATE));



  create policy "Users can read their own token"
  on "public"."push_tokens"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "Users can upsert own push token"
  on "public"."push_tokens"
  as permissive
  for all
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "anon_users_development_image_delete 31hmwi_0 31hmwi_0"
  on "storage"."objects"
  as permissive
  for delete
  to anon
using ((bucket_id = 'farm-connect-images'::text));



  create policy "anon_users_development_image_edit 31hmwi_0"
  on "storage"."objects"
  as permissive
  for update
  to anon
using ((bucket_id = 'farm-connect-images'::text));



  create policy "anon_users_development_image_edit 31hmwi_1"
  on "storage"."objects"
  as permissive
  for select
  to anon
using ((bucket_id = 'farm-connect-images'::text));



  create policy "anon_users_development_image_insertion 31hmwi_0"
  on "storage"."objects"
  as permissive
  for insert
  to anon
with check ((bucket_id = 'farm-connect-images'::text));



