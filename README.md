# Subscription Leak Finder

Subscription Leak Finder analyzes bank transaction CSV files, detects recurring subscription payments, and highlights
monthly spending in a simple dashboard.

## Tech Stack

- Frontend: React, Vite, TypeScript, HeroUI
- Auth: Clerk
- Backend: Hono on Cloudflare Workers
- Database: Cloudflare D1
- Storage: Cloudflare R2
- Data fetching: Ky and TanStack Query
- Validation: Zod

## Project Structure

```text
/apps
  /backend
  /frontend
/packages
  /db
  /shared
```

## Prerequisites

- Node.js 22+
- pnpm
- A Cloudflare account
- A Clerk account

## 1. Install dependencies

```bash
corepack enable
pnpm install
```

## 2. Create Cloudflare resources

Create these resources in Cloudflare:

- One D1 database
- One R2 bucket

Example names:

- D1: `subscription_leak_finder`
- R2: `subscription-leak-finder-uploads`

After creating them, update [wrangler.toml](D:\Code_Projects\subscription_leak_finder\apps\backend\wrangler.toml) with
your real values:

- `database_id`
- `bucket_name`

## 3. Create a Clerk application

Create a new Clerk application from the Clerk dashboard.

You will need two keys:

- Publishable Key: `pk_...`
- Secret Key: `sk_...`

## 4. Configure frontend environment variables

Add these values to [apps/frontend/.env](D:\Code_Projects\subscription_leak_finder\apps\frontend\.env):

```bash
VITE_API_BASE_URL=http://localhost:8787
VITE_API_TIMEOUT_MS=120000
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```

For production, add the same values to Cloudflare Pages environment variables:

```bash
VITE_API_BASE_URL=https://<your-worker>.workers.dev
VITE_API_TIMEOUT_MS=120000
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```

## 5. Configure backend local secrets

Add these values to [apps/backend/.dev.vars](D:\Code_Projects\subscription_leak_finder\apps\backend\.dev.vars):

```bash
CLERK_SECRET_KEY=sk_...
CLERK_PUBLISHABLE_KEY=pk_...
```

## 6. Configure backend production secrets

Add the Clerk secret key to the production Worker:

```bash
pnpm --filter @slf/backend exec wrangler secret put CLERK_SECRET_KEY --env production
```

When prompted, paste your `sk_...` value.

`CLERK_PUBLISHABLE_KEY` is not a secret. Define it
in [wrangler.toml](D:\Code_Projects\subscription_leak_finder\apps\backend\wrangler.toml) under the production vars
section.

## 7. Run the D1 migration

For the remote production database:

```bash
pnpm --filter @slf/backend exec wrangler d1 execute subscription_leak_finder --remote --file ../../packages/db/migrations/0000_init.sql
```

For the local development database:

```bash
pnpm --filter @slf/backend exec wrangler d1 execute subscription_leak_finder --file ../../packages/db/migrations/0000_init.sql
```

## 8. Start the app locally

Start the backend:

```bash
pnpm --filter @slf/backend dev
```

Start the frontend:

```bash
pnpm --filter @slf/frontend dev
```

Or run both together:

```bash
pnpm dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`

## 9. Build the project

```bash
pnpm --filter @slf/frontend build
pnpm --filter @slf/backend build
```

## 10. Deploy the backend

```bash
pnpm --filter @slf/backend exec wrangler deploy --env production
```

## 11. Deploy the frontend

Create a Cloudflare Pages project and use these settings:

- Build command: `pnpm --filter @slf/frontend build`
- Build output directory: `apps/frontend/dist`
- Root directory: `/`

Make sure these Pages environment variables are defined:

```bash
VITE_API_BASE_URL=https://<your-worker>.workers.dev
VITE_API_TIMEOUT_MS=120000
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```

## 12. Use the app

1. Open the frontend app.
2. Sign up or sign in with Clerk.
3. Upload a CSV file.
4. Review detected subscriptions and total monthly cost on the dashboard.
