# Deployment

## Backend — Production dengan Docker Compose

`docker-compose.yml` di root sudah menyediakan service `postgres` dan
`server`. Untuk deploy:

```bash
# 1. Siapkan .env production
cp apps/server/.env.example apps/server/.env
# WAJIB ganti JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, dan kredensial database
# ke nilai yang kuat/acak — jangan pakai nilai contoh di production.

# 2. Build dan jalankan
docker compose up -d --build

# 3. Jalankan migration (bukan `migrate dev` — dev membuat file migration baru,
#    deploy hanya menjalankan yang sudah ada)
docker compose exec server npx prisma migrate deploy

# 4. (Opsional, hanya sekali di awal) seed data
docker compose exec server npx prisma db seed
```

API akan tersedia di `http://<host>:3000/api/v1`.

### Checklist sebelum production

- [ ] `JWT_ACCESS_SECRET` dan `JWT_REFRESH_SECRET` diganti nilai acak yang
      panjang (mis. `openssl rand -hex 64`), berbeda satu sama lain
- [ ] `CORS_ORIGIN` diisi domain mobile app yang sebenarnya, bukan `*`
- [ ] Password database diganti dari default `tabungan_pass`
- [ ] Volume `postgres_data` di-backup berkala
- [ ] Reverse proxy (nginx/Caddy) + HTTPS di depan `server` jika diakses
      dari internet publik
- [ ] `NODE_ENV=production` di `.env`

### Reverse proxy + HTTPS (contoh nginx)

```nginx
server {
    listen 443 ssl;
    server_name api.tabunganumroh.example;

    ssl_certificate     /etc/letsencrypt/live/api.tabunganumroh.example/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tabunganumroh.example/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Mobile — Build APK/AAB dengan EAS

```bash
cd apps/mobile
npm install -g eas-cli
eas login
eas build:configure
```

Buat `eas.json` (jika belum ada dari `build:configure`):

```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

Sebelum build production, pastikan `app.json` → `expo.extra.apiUrl`
mengarah ke URL production backend (bukan `localhost`).

```bash
# Build APK untuk dibagikan langsung / testing internal
eas build --platform android --profile preview

# Build AAB untuk upload ke Play Store
eas build --platform android --profile production

# iOS (butuh akun Apple Developer)
eas build --platform ios --profile production
```

EAS akan memberi link unduhan `.apk`/`.aab` setelah build selesai (build
berjalan di cloud Expo, tidak butuh Android Studio/Xcode terinstal lokal).

### Distribusi internal (tanpa Play Store)

Untuk organisasi Umroh yang hanya butuh distribusi internal ke staf/jamaah:
1. Build dengan profile `preview` (`buildType: apk`)
2. Bagikan link `.apk` langsung, atau upload ke Firebase App Distribution
3. Pengguna perlu mengizinkan "Install from unknown sources" di Android

## Verifikasi akhir sebelum go-live

- [ ] `docker compose up -d --build` berhasil tanpa error, kedua service
      `healthy`/running
- [ ] `prisma migrate deploy` berhasil, tabel-tabel terbentuk
- [ ] Login admin & jamaah berhasil dari mobile app yang mengarah ke
      backend production
- [ ] Alur setor → konfirmasi admin → saldo bertambah teruji end-to-end
- [ ] Export CSV laporan berhasil diunduh
- [ ] Backup database terjadwal (mis. `pg_dump` harian via cron)
