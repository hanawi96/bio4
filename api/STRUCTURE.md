# Backend Structure - Authentication

## Cấu trúc thư mục

```
api/
├── src/
│   ├── routes/
│   │   ├── auth.ts              # Auth endpoints (register, login, me)
│   │   ├── bio.ts
│   │   ├── blocks.ts
│   │   ├── editor.ts
│   │   ├── header-presets.ts
│   │   ├── links.ts
│   │   ├── themes.ts
│   │   └── upload.ts
│   ├── middleware/
│   │   └── auth.ts              # JWT verification middleware
│   ├── schemas/
│   │   └── auth.ts              # Zod validation schemas
│   ├── utils/
│   │   └── auth.ts              # Hash password, JWT functions
│   ├── db.ts                    # Database functions (existing)
│   ├── db-auth.ts               # Auth-related database functions
│   ├── index.ts                 # Main app entry
│   ├── storage.ts
│   ├── types.ts                 # TypeScript types (updated with JWT_SECRET)
│   └── validate.ts
├── package.json                 # Added @noble/hashes, jose
├── wrangler.toml                # Added JWT_SECRET
├── AUTH_API.md                  # API documentation
└── STRUCTURE.md                 # This file
```

## Files mới tạo

### 1. `src/utils/auth.ts`
- `hashPassword()` - Hash password bằng PBKDF2
- `verifyPassword()` - Verify password
- `generateToken()` - Tạo JWT token
- `verifyToken()` - Verify JWT token

### 2. `src/middleware/auth.ts`
- `authMiddleware()` - Middleware để verify JWT token
- Gắn `userId` vào context nếu token hợp lệ

### 3. `src/schemas/auth.ts`
- `registerSchema` - Validation cho đăng ký
- `loginSchema` - Validation cho đăng nhập

### 4. `src/db-auth.ts`
- `getUserByEmail()` - Lấy user theo email
- `getUserById()` - Lấy user theo ID
- `createUser()` - Tạo user mới
- `createBioPageForUser()` - Tạo bio_page cho user

### 5. `src/routes/auth.ts`
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `GET /auth/me` - Lấy thông tin user (cần token)

## Dependencies mới

```json
{
  "@noble/hashes": "^1.3.3",  // Hash password (lightweight cho Workers)
  "jose": "^5.2.0"             // JWT cho Cloudflare Workers
}
```

## Environment Variables

```toml
[vars]
JWT_SECRET = "dev-secret-key-change-in-production-12345678"
```

## Workflow

1. User đăng ký → Tạo `users` record + `bio_pages` record
2. User đăng nhập → Nhận JWT token (expires in 7 days)
3. Các API calls khác gửi token trong header `Authorization: Bearer <token>`
4. Middleware verify token và gắn `userId` vào context

## Testing

Tất cả endpoints đã được test thành công:
- ✅ Register với email/username mới
- ✅ Register với email đã tồn tại (error)
- ✅ Login với credentials đúng
- ✅ Login với password sai (error)
- ✅ Get user info với token hợp lệ
- ✅ Get user info với token không hợp lệ (error)
- ✅ Bio page tự động được tạo và published
