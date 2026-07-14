# API Reference

Base URL: `http://localhost:3000/api/v1` (lihat `API_PREFIX` / `API_VERSION`
di `.env`)

## Konvensi

**Response sukses**

```json
{
  "success": true,
  "statusCode": 200,
  "data": { },
  "timestamp": "2026-07-12T10:00:00.000Z"
}
```

**Response error**

```json
{
  "success": false,
  "statusCode": 400,
  "path": "/api/v1/auth/login",
  "timestamp": "2026-07-12T10:00:00.000Z",
  "message": "Nomor HP atau password salah"
}
```

**Autentikasi** — kirim header `Authorization: Bearer <accessToken>` di
setiap endpoint kecuali `POST /auth/login` dan `POST /auth/refresh`.

**Pagination** — endpoint list menerima query `page` (default 1) dan
`limit` (default 20, maks 100), mengembalikan:

```json
{
  "data": [ ],
  "meta": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 }
}
```

---

## Auth

### `POST /auth/login`

Rate-limited: 5 percobaan / menit.

Request:
```json
{ "phoneNumber": "081234567890", "password": "Admin123!", "rememberMe": true }
```

Response `data`:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { "id": "...", "fullName": "Admin Utama", "phoneNumber": "081234567890", "role": "ADMIN" }
}
```

### `POST /auth/refresh`

Request: `{ "refreshToken": "..." }`
Response `data`: `{ "accessToken": "...", "refreshToken": "..." }` (token lama otomatis di-revoke)

### `POST /auth/logout` 🔒

Request: `{ "refreshToken": "..." }` → mencabut refresh token tersebut.

---

## Users (Admin only)

Semua endpoint di bawah butuh role `ADMIN`.

| Method | Path | Deskripsi |
|---|---|---|
| POST | `/users` | Tambah jamaah baru (otomatis membuat `saving_account`) |
| GET | `/users?page=&limit=&search=` | List jamaah, cari nama/nomor HP |
| GET | `/users/:id` | Detail jamaah + saldo |
| PATCH | `/users/:id` | Edit data jamaah |
| DELETE | `/users/:id` | Soft delete jamaah |

Request `POST /users`:
```json
{
  "fullName": "Ahmad",
  "phoneNumber": "081111111111",
  "email": "ahmad@email.com",
  "password": "User123!",
  "targetAmount": 25000000
}
```

---

## Savings (Jamaah)

### `GET /savings/me` 🔒

Response `data`:
```json
{
  "currentBalance": 12500000,
  "targetAmount": 25000000,
  "remainingAmount": 12500000,
  "progressPercent": 50
}
```

---

## Transactions

| Method | Path | Role | Deskripsi |
|---|---|---|---|
| POST | `/transactions` | Admin | Catat setoran/penarikan langsung (status `CONFIRMED`) |
| GET | `/transactions?page=&userId=&type=` | Admin | List semua transaksi |
| GET | `/transactions/me?page=&type=` | Jamaah | Riwayat transaksi milik sendiri |
| POST | `/transactions/request` | Jamaah | Ajukan setoran (status `PENDING`, saldo belum berubah) |
| PATCH | `/transactions/:id/confirm` | Admin | Konfirmasi permintaan → saldo bertambah |
| PATCH | `/transactions/:id/reject` | Admin | Tolak permintaan → jamaah dapat notifikasi |
| PATCH | `/transactions/:id` | Admin | Edit nominal/catatan (saldo disesuaikan otomatis) |
| DELETE | `/transactions/:id` | Admin | Soft delete (saldo dikembalikan) |

Request `POST /transactions`:
```json
{ "userId": "uuid", "amount": 500000, "type": "DEPOSIT", "note": "Setoran rutin" }
```

Request `POST /transactions/request`:
```json
{ "amount": 500000, "note": "Setoran bulan ini" }
```

---

## Reports (Admin only)

| Method | Path | Deskripsi |
|---|---|---|
| GET | `/reports/dashboard` | Ringkasan: total user, total saldo, setoran hari ini/bulan ini |
| GET | `/reports/summary?period=daily\|weekly\|monthly\|yearly` | Rekap transaksi periode tertentu |
| GET | `/reports/export?period=...` | Unduh CSV rekap transaksi |

Response `GET /reports/dashboard`:
```json
{ "totalUsers": 120, "totalSavings": 250000000, "todayDeposit": 5500000, "monthlyDeposit": 45000000 }
```

---

## Notifications

| Method | Path | Deskripsi |
|---|---|---|
| GET | `/notifications/me` | 50 notifikasi terbaru milik sendiri |
| PATCH | `/notifications/:id/read` | Tandai sudah dibaca |

---

## Profile (semua role)

| Method | Path | Deskripsi |
|---|---|---|
| GET | `/profile/me` | Data profil sendiri |
| PATCH | `/profile/change-password` | Ubah password |

Request `PATCH /profile/change-password`:
```json
{ "currentPassword": "User123!", "newPassword": "PasswordBaru456!" }
```

---

## HTTP status codes yang dipakai

| Code | Arti |
|---|---|
| 200 | Sukses |
| 400 | Validasi gagal / bad request |
| 401 | Token tidak ada/kedaluwarsa/tidak valid |
| 403 | Role tidak diizinkan mengakses resource |
| 404 | Resource tidak ditemukan |
| 409 | Konflik (mis. nomor HP sudah terdaftar) |
| 429 | Rate limit terlampaui |
| 500 | Kesalahan server |
