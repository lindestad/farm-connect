-- Repair the demo users created by the previous auth rebuild migration.
--
-- Supabase Auth scans several token columns into strings during password login.
-- Manually inserted auth.users rows must store empty strings, not nulls, in
-- these fields.

update auth.users
set confirmation_token = coalesce(confirmation_token, ''),
    recovery_token = coalesce(recovery_token, ''),
    email_change = coalesce(email_change, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    confirmation_sent_at = coalesce(confirmation_sent_at, email_confirmed_at, now()),
    updated_at = now()
where lower(email) in ('customer-demo@demo.com', 'farmer-demo@demo.com');
