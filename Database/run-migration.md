# Database Migration Guide

## Bước 1: Chạy Migration (thêm cột config_v2)

```bash
# Local D1 database
npx wrangler d1 execute DB --local --file=./Database/migrations/001_add_theme_v2.sql

# Production D1 database
npx wrangler d1 execute DB --file=./Database/migrations/001_add_theme_v2.sql
```

## Bước 2: Seed Theme "Minimal Pro"

```bash
# Local
npx wrangler d1 execute DB --local --file=./Database/seeds/001_seed_minimal_pro_theme.sql

# Production
npx wrangler d1 execute DB --file=./Database/seeds/001_seed_minimal_pro_theme.sql
```

## Bước 3: Verify

```bash
# Check if theme exists
npx wrangler d1 execute DB --local --command="SELECT key, name, config_v2 IS NOT NULL as has_v2 FROM theme_presets WHERE key='minimal-pro'"
```

## Rollback (nếu cần)

```bash
# Remove column (SQLite không support DROP COLUMN trực tiếp, cần recreate table)
# Hoặc đơn giản: set config_v2 = NULL
npx wrangler d1 execute DB --local --command="UPDATE theme_presets SET config_v2 = NULL WHERE key='minimal-pro'"
```
