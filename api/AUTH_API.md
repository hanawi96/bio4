# Authentication API Documentation

## Endpoints

### 1. Đăng ký tài khoản mới
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "myusername",
  "display_name": "My Display Name" // optional
}
```

**Response (201):**
```json
{
  "message": "Đăng ký thành công",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "My Display Name",
    "avatar_url": null
  }
}
```

**Errors:**
- `400` - Email đã được sử dụng
- `400` - Username đã được sử dụng
- `400` - Dữ liệu không hợp lệ

**Notes:**
- Password phải có ít nhất 6 ký tự
- Username phải có 3-30 ký tự, chỉ chứa chữ cái, số, gạch dưới và gạch ngang
- Tự động tạo bio_page với username đã chọn

---

### 2. Đăng nhập
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "My Display Name",
    "avatar_url": null
  }
}
```

**Errors:**
- `401` - Email hoặc mật khẩu không đúng
- `403` - Tài khoản đã bị vô hiệu hóa

---

### 3. Lấy thông tin user hiện tại
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "My Display Name",
    "avatar_url": null,
    "is_active": 1,
    "created_at": "2026-01-08 06:35:28"
  }
}
```

**Errors:**
- `401` - Token không hợp lệ hoặc đã hết hạn
- `404` - User không tồn tại

---

## Security

- Password được hash bằng PBKDF2 với SHA256
- JWT token có thời hạn 7 ngày
- Token phải được gửi trong header `Authorization: Bearer <token>`

## Testing

```powershell
# Đăng ký
Invoke-RestMethod -Uri "http://127.0.0.1:8787/auth/register" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"123456","username":"testuser","display_name":"Test User"}'

# Đăng nhập
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8787/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"123456"}'
$token = $response.token

# Lấy thông tin user
Invoke-RestMethod -Uri "http://127.0.0.1:8787/auth/me" -Method GET -Headers @{Authorization="Bearer $token"}
```
