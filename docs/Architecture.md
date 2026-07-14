# Architecture

## Prinsip

- **Clean Architecture** — setiap lapisan punya satu tanggung jawab dan hanya
  bergantung ke dalam (controller → service → repository → database), tidak
  pernah sebaliknya.
- **Repository Pattern** — semua query Prisma terisolasi di file
  `*.repository.ts`. Service layer tidak pernah memanggil Prisma langsung
  kecuali untuk transaksi lintas-repository (mis. `$transaction`).
- **Dependency Injection** — bawaan NestJS; semua service/repository di-inject
  lewat constructor, bukan di-instantiate manual, sehingga mudah di-mock saat
  testing.
- **DTO + Validation** — setiap request divalidasi lewat `class-validator`
  sebelum menyentuh service layer. Response tidak pernah mengembalikan
  `passwordHash` atau field sensitif lain.
- **Feature-based folder structure** — modul dikelompokkan per domain
  (`auth`, `users`, `savings`, `transactions`, `reports`, `notifications`,
  `profile`), bukan per tipe file.

## Backend — alur request

```
Client (mobile)
  │  HTTP + Bearer token
  ▼
Controller        → validasi DTO, ekstrak user dari token (guard)
  │
  ▼
Service           → business logic, orkestrasi, aturan (mis. balance harus
  │                  konsisten dengan ledger transaksi)
  ▼
Repository         → satu-satunya lapisan yang membangun query Prisma
  │
  ▼
PostgreSQL
```

Setiap response sukses dibungkus `ResponseInterceptor` menjadi:

```json
{ "success": true, "statusCode": 200, "data": { ... }, "timestamp": "..." }
```

Setiap error ditangani `HttpExceptionFilter` menjadi bentuk yang sama,
sehingga mobile client hanya perlu satu bentuk error handling di seluruh app.

## Auth & keamanan

- **JWT Access Token** (default 15 menit) dipakai untuk otorisasi setiap
  request.
- **Refresh Token** (default 7 hari) disimpan **di-hash** (SHA-256) di
  database — kebocoran database tidak otomatis membocorkan token yang bisa
  dipakai. Refresh token dirotasi setiap kali dipakai (token lama langsung
  di-revoke).
- **RolesGuard** membaca metadata `@Roles(...)` di controller dan menolak
  akses jika role user tidak cocok.
- **Rate limiting** (Throttler) membatasi percobaan login untuk mencegah
  brute force.
- **Helmet** menambahkan header keamanan standar; **CORS** dibatasi lewat
  environment variable.

## Konsistensi saldo tabungan

`saving_accounts.current_balance` **tidak pernah diubah langsung**. Semua
perubahan saldo terjadi lewat `TransactionsRepository.recordTransaction()`
atau alur konfirmasi/tolak, yang membungkus insert transaksi + update saldo
dalam satu `prisma.$transaction`. Ini menjamin ledger (`transactions`) dan
saldo (`saving_accounts.current_balance`) tidak pernah bergeser satu sama
lain, bahkan jika terjadi error di tengah proses.

### Alur setoran

Ada dua jalur untuk mencatat setoran, sesuai siapa yang memulai:

1. **Admin mencatat langsung** (`POST /transactions`) — status langsung
   `CONFIRMED`, saldo langsung bertambah.
2. **Jamaah mengajukan** (`POST /transactions/request`) — status `PENDING`,
   saldo **belum** berubah. Admin lalu memanggil `PATCH /transactions/:id/confirm`
   (saldo bertambah) atau `/reject` (saldo tetap, jamaah dapat notifikasi).

## Mobile — alur data

```
Screen (app/*.tsx)
  │  React Query hook (src/hooks/*)
  ▼
API function (src/api/*.ts)
  │  Axios instance dengan interceptor
  ▼
Backend REST API
```

- **Zustand** menyimpan state auth (`user`) di memori, dipersist lewat
  **Expo SecureStore** (bukan AsyncStorage biasa) supaya token tidak
  tersimpan plaintext yang mudah diakses.
- **React Query** menangani caching, refetch, dan invalidation — misalnya
  setelah setoran berhasil dicatat, cache `savings`, `transactions`, dan
  `reports` otomatis di-invalidate agar dashboard langsung ter-update.
- Axios interceptor menangani refresh token otomatis: jika request kena
  401, token di-refresh sekali, request asli di-replay, dan request lain
  yang menunggu di-antre supaya tidak memicu banyak refresh sekaligus.

## Kenapa desainnya sederhana

Target pengguna utama adalah jamaah lanjut usia, sehingga UI sengaja
menghindari animasi berlebihan, gradient, dan navigasi bertingkat — setiap
aksi penting (lihat saldo, setor, lihat riwayat) bisa dicapai dalam 1-2 tap
dari dashboard.
