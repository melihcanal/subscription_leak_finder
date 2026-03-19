# Subscription Leak Finder

Minimal, developer-focused MVP that detects recurring subscription payments from bank CSVs, stores uploads in R2, and
surfaces monthly cost.

## Stack

- Frontend: React + Vite + TypeScript + **HeroUI**
- Auth: **Clerk** (frontend + backend)
- Backend: **Hono** on Cloudflare Workers
- Database: Cloudflare D1 (SQLite) via Drizzle ORM
- Storage: Cloudflare R2
- Validation: Zod
- State management: TanStack Query
- HTTP client: **Ky**

## Project Structure

```
/apps
  /frontend
  /backend
/packages
  /db
  /shared
```

## Prerequisites

- Node.js 22+
- pnpm (via corepack)
- Cloudflare account with Workers, D1, R2 enabled
- Clerk account

## 1) Install Dependencies

```
corepack enable
pnpm install
```

## 2) Create Cloudflare Resources

Create a D1 database and an R2 bucket in the Cloudflare dashboard (or via Wrangler).

Example names used below:

- D1: `subscription_leak_finder`
- R2: `subscription-leak-finder-uploads`

## 3) Configure Backend (Wrangler)

Update `apps/backend/wrangler.toml` with your real IDs:

- `database_id`
- `bucket_name`

Set your frontend origin for CORS:

```
CORS_ORIGIN = "http://localhost:5173"
```

## 4) Clerk Setup

Create a Clerk application and copy:

- **Publishable Key** � used by frontend (`@clerk/react`)
- **Secret Key** � used by backend

### Backend (Workers)

Store the secret key as a Wrangler secret:

```
pnpm --filter @slf/backend exec wrangler secret put CLERK_SECRET_KEY --env dev
pnpm --filter @slf/backend exec wrangler secret put CLERK_SECRET_KEY --env production
```

### Frontend (Vite)

Set this in `apps/frontend/.env` (local) and in Cloudflare Pages environment variables (prod):

```
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```

## 5) Run D1 Migrations

### Remote (production D1)

```
pnpm --filter @slf/backend exec wrangler d1 execute subscription_leak_finder --remote --file ../../packages/db/migrations/0000_init.sql
```

### Local (Wrangler dev D1)

```
pnpm --filter @slf/backend exec wrangler d1 execute subscription_leak_finder --file ../../packages/db/migrations/0000_init.sql
```

> If you previously created tables without `user_id`, recreate the DB or drop tables and re-run the migration.

## 6) Local Development

### Backend (Workers)

```
pnpm --filter @slf/backend dev
```

### Frontend (Vite)

```
pnpm --filter @slf/frontend dev
```

### Or run both at once

```
pnpm dev
```

Frontend runs at `http://localhost:5173` and calls the Worker at `http://localhost:8787`.

## 7) Production Environment Variables (Frontend)

Set this in **Cloudflare Pages � Settings � Environment variables**:

```
VITE_API_BASE_URL=https://<your-worker>.workers.dev
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```

## 8) Deploy Backend (Workers)

```
pnpm --filter @slf/backend exec wrangler deploy --env production
```

## 9) Deploy Frontend (Pages)

Create a Pages project with:

- **Build command**:
  ```
  pnpm --filter @slf/frontend build
  ```
- **Build output directory**:
  ```
  apps/frontend/dist
  ```
- **Root directory**:
  ```
  /
  ```

## API Endpoints

All endpoints are protected by Clerk auth.

- `POST /upload` (multipart/form-data, field: `file`)
- `GET /subscriptions`
- `GET /summary`
- `GET /health`

## CSV Format

Required columns:

```
date, description, amount
```

## Detection Rules

The recurring detection is rule-based:

- Merchant similarity (token-based)
- Amount tolerance �5%
- Repeats at least 2 times
- Monthly interval between 25�35 days

## Troubleshooting

### D1_ERROR: no such table

Run the migration again (remote):

```
pnpm --filter @slf/backend exec wrangler d1 execute subscription_leak_finder --remote --file ../../packages/db/migrations/0000_init.sql
```

### Local D1 missing tables

Run without `--remote` (local):

```
pnpm --filter @slf/backend exec wrangler d1 execute subscription_leak_finder --file ../../packages/db/migrations/0000_init.sql
```

---

If anything is unclear or breaks, ping me with the exact command and output.
