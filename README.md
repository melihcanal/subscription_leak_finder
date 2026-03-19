# Subscription Leak Finder

Minimal, developer?focused MVP that detects recurring subscription payments from bank CSVs, stores uploads in R2, and surfaces monthly cost.

## Stack

- Frontend: React + Vite + TypeScript + TailwindCSS
- Backend: Cloudflare Workers (TypeScript)
- Database: Cloudflare D1 (SQLite) via Drizzle ORM
- Storage: Cloudflare R2
- Validation: Zod
- State management: React Query

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

The file already contains example bindings and environments.

## 4) Run D1 Migrations

### Remote (production D1)

Run once to create tables in your D1 database:

```
pnpm --filter @slf/backend exec wrangler d1 execute subscription_leak_finder --remote --file ../../packages/db/migrations/0000_init.sql
```

### Local (Wrangler dev D1)

Create the same tables in your local D1 for development:

```
pnpm --filter @slf/backend exec wrangler d1 execute subscription_leak_finder --file ../../packages/db/migrations/0000_init.sql
```

## 5) Local Development

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

## 6) Production Environment Variables (Frontend)

Set this in **Cloudflare Pages ? Settings ? Environment variables**:

```
VITE_API_BASE_URL=https://<your-worker>.workers.dev
```

## 7) Deploy Backend (Workers)

```
pnpm --filter @slf/backend exec wrangler deploy --env production
```

## 8) Deploy Frontend (Pages)

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

- `POST /upload` (multipart/form-data, field: `file`)
- `GET /subscriptions`
- `GET /summary`

## CSV Format

Required columns:

```
date, description, amount
```

## Detection Rules

The recurring detection is rule?based:

- Merchant similarity (token?based)
- Amount tolerance ?5%
- Repeats at least 2 times
- Monthly interval between 25?35 days
