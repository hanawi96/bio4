# Deployment Guide

## Prerequisites

- Cloudflare account
- Node.js 18+
- Wrangler CLI: `npm install -g wrangler`

## Setup

### 1. Database (D1)

```bash
# Create database
wrangler d1 create bio-link-db

# Run migration
wrangler d1 execute bio-link-db --file=database/migrations/001_init.sql

# Seed data (optional)
wrangler d1 execute bio-link-db --file=database/seeds/presets.sql
```

Update `api/wrangler.toml` with your database_id

### 2. Storage (R2)

```bash
# Create bucket
wrangler r2 bucket create bio-link-images
```

Configure public access in Cloudflare dashboard

### 3. API (Workers)

```bash
cd api
npm install
wrangler deploy
```

### 4. Frontend (Pages)

```bash
cd frontend
npm install
npm run build
```

Connect GitHub repo to Cloudflare Pages:
- Build command: `npm run build`
- Build output: `.svelte-kit/cloudflare`
- Environment variable: `VITE_API_URL=https://your-api.workers.dev`

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://your-api.workers.dev
```

### API (wrangler.toml)
Already configured with D1 and R2 bindings

## Custom Domain

1. Add domain in Cloudflare Pages
2. Update R2 public URL in `api/src/storage.ts`
3. Configure CORS if needed
