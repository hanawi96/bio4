# Bio Link

Link in bio platform built with SvelteKit + Cloudflare Workers

## Stack

- **Frontend**: SvelteKit + Tailwind CSS
- **Backend**: Cloudflare Workers + Hono
- **Database**: Cloudflare D1
- **Storage**: Cloudflare R2
- **Deploy**: Cloudflare Pages

## Structure

```
frontend/   - SvelteKit app (editor + public bio pages)
api/        - Cloudflare Workers API (Hono)
database/   - D1 schema & migrations
docs/       - Documentation
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### API
```bash
cd api
npm install
npm run dev
```

## Deploy

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
