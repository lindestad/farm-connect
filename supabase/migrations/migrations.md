# Supabase migrations

This directory contains the database schema migrations for FarmConnect. Each file is applied in timestamp order by the Supabase CLI.

## Normal workflow

1. Create or edit a migration file in `supabase/migrations/`.
2. Review what would be applied:

   ```bash
   npx supabase migration list --linked
   npx supabase db push --dry-run --linked
   ```

3. Apply the pending migrations:

   ```bash
   npx supabase db push --linked
   ```

4. Confirm local and remote history match:

   ```bash
   npx supabase migration list --linked
   ```

## Avoid SQL editor drift

Pasting a migration into the Supabase SQL editor changes the database, but it does not mark the migration as applied in `supabase_migrations.schema_migrations`. After that, `db push` may try to run the same migration again.

If a migration has already been applied manually, mark it as applied before running `db push`:

```bash
npx supabase migration repair <timestamp> --status applied --linked
```

Use the timestamp prefix from the migration filename, for example `202604301945`.

## Generated local files

`supabase/.temp/` is created by the CLI when the project is linked. It contains local connection metadata and should stay untracked.
