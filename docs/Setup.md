# Setup — Instalasi dari Nol

## 1. Software yang dibutuhkan

| Software | Versi | Cek dengan |
|---|---|---|
| Node.js | 20.x LTS | `node -v` |
| pnpm | 9.x | `pnpm -v` (install: `npm i -g pnpm`) |
| Docker + Docker Compose | terbaru | `docker -v` |
| Expo Go (di HP) | terbaru | dari App Store / Play Store |
| Git | terbaru | `git -v` |

Opsional (untuk build APK): akun Expo (EAS).

## 2. Clone / extract project

```bash
# Jika dari ZIP:
unzip tabungan-umroh.zip
cd tabungan-umroh
```

## 3. Jalankan database (PostgreSQL via Docker)

```bash
docker compose up -d postgres
docker compose ps   # pastikan status "healthy"
```

Database berjalan di `localhost:5432`, kredensial default ada di
`docker-compose.yml` (`tabungan_user` / `tabungan_pass` / `tabungan_umroh`).

## 4. Setup Backend

```bash
cd apps/server
cp .env.example .env
pnpm install
```

Edit `.env` bila perlu — nilai default sudah cocok dengan
`docker-compose.yml`. **Wajib ganti** `JWT_ACCESS_SECRET` dan
`JWT_REFRESH_SECRET` sebelum deploy ke production.

```bash
pnpm prisma:generate     # generate Prisma Client
pnpm prisma:migrate      # buat tabel-tabel di database
pnpm prisma:seed         # isi data awal (1 admin + 4 jamaah contoh)
pnpm start:dev           # jalankan API di http://localhost:3000
```

Cek API hidup: buka `http://localhost:3000/api/v1/auth/login` di browser —
akan muncul error 404/405 (wajar, karena itu endpoint POST), yang penting
server merespons, bukan connection refused.

## 5. Setup Mobile

Di terminal baru:

```bash
cd apps/mobile
pnpm install
```

**Penting**: sesuaikan `expo.extra.apiUrl` di `app.json` supaya HP/emulator
bisa menjangkau backend:

| Cara testing | apiUrl yang dipakai |
|---|---|
| Expo Go di HP fisik (WiFi sama dengan laptop) | `http://<IP-LAN-laptop>:3000/api/v1` |
| Android Emulator | `http://10.0.2.2:3000/api/v1` |
| iOS Simulator | `http://localhost:3000/api/v1` |

Cari IP LAN laptop dengan `ipconfig` (Windows) atau `ifconfig`/`ip a` (Mac/Linux).

```bash
pnpm start
```

Scan QR code dengan Expo Go, atau tekan `a` (Android emulator) / `i` (iOS
simulator) di terminal.

## 6. Login dengan akun demo

| Role | Nomor HP | Password |
|---|---|---|
| Admin | 081234567890 | Admin123! |
| Jamaah | 081111111111 | User123! |

## Troubleshooting

**"Network request failed" di mobile app**
→ `apiUrl` di `app.json` salah, atau backend belum jalan. Pastikan HP dan
laptop satu jaringan WiFi jika pakai Expo Go di HP fisik.

**`prisma migrate` gagal connect ke database**
→ Cek `docker compose ps`, pastikan container `postgres` statusnya
`healthy`. Cek `DATABASE_URL` di `.env` cocok dengan kredensial di
`docker-compose.yml`.

**Port 3000 atau 5432 sudah dipakai**
→ Ganti `PORT` di `.env` backend, atau ganti mapping port di
`docker-compose.yml` (mis. `"5433:5432"`), lalu sesuaikan `DATABASE_URL`.

**`npx prisma generate` gagal download engine**
→ Biasanya karena jaringan/firewall memblokir `binaries.prisma.sh`. Coba
jaringan lain, atau set `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` sebagai
env var sementara (hanya untuk lingkungan development/offline).
