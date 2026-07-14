# Tabungan Umroh — Mobile App

Expo (React Native) + TypeScript + Expo Router + NativeWind. Role-aware
navigation (Admin / Jamaah), React Query for server state, Zustand + Expo
SecureStore for auth, React Hook Form + Zod for every form.

## Requirements

- Node.js 20+
- pnpm 9+ (or npm)
- Expo Go app on your phone, or an Android/iOS simulator
- The backend API running (see `apps/server/README.md`)

## Setup

```bash
cd apps/mobile
pnpm install   # or: npm install
```

Point the app at your backend: edit `apiUrl` in `app.json` under `expo.extra`.

- If testing on a **physical phone** via Expo Go, `localhost` will not reach
  your computer — use your computer's LAN IP instead, e.g.
  `http://192.168.1.10:3000/api/v1`.
- If testing on the **Android emulator**, use `http://10.0.2.2:3000/api/v1`.
- If testing on the **iOS simulator**, `http://localhost:3000/api/v1` works.

```bash
pnpm start
```

Scan the QR code with Expo Go, or press `a` / `i` for an emulator/simulator.

## Login with seeded accounts

| Role  | Phone         | Password   |
|-------|---------------|------------|
| Admin | 081234567890  | Admin123!  |
| User  | 081111111111  | User123!   |

## Screens

- **Jamaah**: Splash → Login → Dashboard (saldo/target/progress) → Setor
  Tabungan (submits a request, awaits admin confirmation) → Riwayat →
  Notifikasi → Profil (ubah password, logout)
- **Admin**: Login Admin → Dashboard (ringkasan) → Kelola User (CRUD) →
  Transaksi (catat setoran langsung, atau konfirmasi/tolak permintaan
  setoran dari jamaah) → Laporan (filter periode + export CSV) → Akun

## Building an APK

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

See `/docs/Deployment.md` at the repo root for the full production build and
release flow.
