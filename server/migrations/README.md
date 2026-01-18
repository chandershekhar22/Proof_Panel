# Database Migrations

This folder contains SQL migration files for Supabase database schema.

## How to Run Migrations

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy and paste the SQL from the migration file
6. Click **Run**

## Migration Files

| File | Description | Status |
|------|-------------|--------|
| `001_create_verified_panelists.sql` | Creates verified_panelists table | Pending |

## Naming Convention

Migration files follow this pattern:
```
{number}_{description}.sql
```

- `number`: 3-digit sequential number (001, 002, 003...)
- `description`: Brief description with underscores

## After Running a Migration

Update the status in this README from "Pending" to "Applied" with the date:

```
| `001_create_verified_panelists.sql` | Creates verified_panelists table | Applied (2026-01-18) |
```

## Supabase Credentials

Your Supabase credentials should be in `server/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Get these from: Supabase Dashboard → Settings → API
