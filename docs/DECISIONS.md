# Architecture Decisions

## Tại sao chọn stack này?

### SvelteKit
- Bundle size nhỏ (~20KB)
- Reactivity tự nhiên cho live preview
- SSR/SSG flexible
- File-based routing đơn giản

### Cloudflare Workers + Hono
- Edge computing → latency thấp
- Zero cold start
- Hono nhẹ, API gọn
- Free tier rộng rãi (100k requests/day)

### D1 (SQLite)
- Đơn giản, không cần setup
- Query nhanh cho read-heavy workload
- JSON support tốt
- Free tier: 5GB storage

### R2
- Rẻ hơn S3 (no egress fees)
- S3-compatible API
- CDN tích hợp
- Free tier: 10GB storage

## Trade-offs

### D1 Beta
- **Risk**: Breaking changes có thể xảy ra
- **Mitigation**: Schema đơn giản, dễ migrate

### JSON Storage
- **Risk**: Không có schema validation ở DB level
- **Mitigation**: Validation ở API layer (Zod)

### No Auth System
- **Current**: Không có auth trong MVP
- **Future**: Thêm Cloudflare Access hoặc JWT

## Alternatives Considered

### Supabase
- ❌ Chi phí cao hơn
- ❌ Vendor lock-in
- ✅ Postgres mature hơn D1

### Vercel + Planetscale
- ❌ Chi phí cao
- ❌ Cold start với serverless functions
- ✅ DX tốt hơn

### Traditional VPS
- ❌ Phải maintain server
- ❌ Scaling khó
- ✅ Full control
