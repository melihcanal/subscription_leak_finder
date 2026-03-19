# Subscription Leak Finder

Minimal, developer-focused MVP that detects recurring subscription payments from bank CSVs, stores uploads in R2, and surfaces the monthly cost.

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

## Local Development

### 1) Install dependencies

```
npm install
```

### 2) Configure Cloudflare

Create a D1 database and R2 bucket, then update `apps/backend/wrangler.toml`:

- `database_id`
- `bucket_name`

Run the schema migration:

```
wrangler d1 execute subscription_leak_finder --file packages/db/migrations/0000_init.sql
```

### 3) Frontend env

Copy the env template and adjust if needed:

```
Copy-Item apps/frontend/.env.example apps/frontend/.env
```

### 4) Run dev servers

Backend (Workers):

```
npm run dev:backend
```

Frontend (Vite):

```
npm run dev:frontend
```

Frontend runs on `http://localhost:5173` and calls the Worker at `http://localhost:8787`.

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

The recurring detection is rule-based:

- Merchant similarity (token-based)
- Amount tolerance ?5%
- Repeats at least 2 times
- Monthly interval between 25?35 days

## Deployment

- Frontend: Cloudflare Pages
- Backend: Cloudflare Workers

Ensure your production environment variables match your deployment origins and bindings.
