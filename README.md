# Tabungan Umroh

Aplikasi internal untuk biro perjalanan Umroh dalam mengelola tabungan jamaah.
Dibangun dengan prioritas kesederhanaan dan aksesibilitas — mayoritas
pengguna adalah jamaah lanjut usia.

Monorepo (Turborepo) berisi:

```
apps/
  server/   NestJS + Prisma + PostgreSQL — REST API
  mobile/   Expo (React Native) + TypeScript — aplikasi jamaah & admin
docs/       Dokumentasi lengkap (arsitektur, API, database, setup, deployment)
```

## Fitur utama

**Jamaah (User)**
- Dashboard: saldo, target, sisa target, progress bar
- Setor tabungan (kirim permintaan → menunggu konfirmasi admin)
- Riwayat transaksi (filter setoran/penarikan)
- Notifikasi
- Ubah password

**Admin**
- Dashboard: total user, total saldo, setoran hari ini/bulan ini
- Kelola user (tambah, edit, hapus, cari)
- Kelola transaksi (catat setoran langsung, konfirmasi/tolak permintaan jamaah)
- Laporan (harian/mingguan/bulanan/tahunan) + export CSV
- Ubah password

## Quick start

```bash
# 1. Jalankan database
docker compose up -d postgres

# 2. Backend
cd apps/server
cp .env.example .env
pnpm install && pnpm prisma:generate && pnpm prisma:migrate && pnpm prisma:seed
pnpm start:dev

# 3. Mobile (di terminal lain)
cd apps/mobile
pnpm install
pnpm start
```

Detail lengkap ada di [`docs/Setup.md`](./docs/Setup.md).

## Akun demo (hasil seed)

| Role  | Nomor HP      | Password   |
|-------|---------------|------------|
| Admin | 081234567890  | Admin123!  |
| User  | 081111111111  | User123!   |

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [Architecture.md](./docs/Architecture.md) | Prinsip arsitektur, clean architecture, alur data |
| [FolderStructure.md](./docs/FolderStructure.md) | Struktur folder lengkap monorepo |
| [API.md](./docs/API.md) | Kontrak seluruh endpoint REST |
| [Database.md](./docs/Database.md) | ERD, skema tabel, relasi |
| [Setup.md](./docs/Setup.md) | Instalasi dari nol sampai jalan |
| [Deployment.md](./docs/Deployment.md) | Build production, Docker, build APK |

## Tech stack

| Layer | Teknologi |
|---|---|
| Mobile | Expo, React Native, Expo Router, TypeScript, NativeWind, React Hook Form, Zod, React Query, Axios, Expo Secure Store |
| Backend | NestJS, Prisma, PostgreSQL, JWT + Refresh Token, Helmet, Rate Limiter, class-validator |
| Database | PostgreSQL 16 |
| DevOps | Docker Compose, Turborepo |
