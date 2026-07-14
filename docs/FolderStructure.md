# Folder Structure

```
tabungan-umroh/
├── apps/
│   ├── server/                        # NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # Skema database (8 entitas)
│   │   │   └── seed.ts                # Data awal (admin + 4 jamaah)
│   │   ├── src/
│   │   │   ├── common/                # Lintas-modul, tidak spesifik domain
│   │   │   │   ├── decorators/        # @Roles, @CurrentUser
│   │   │   │   ├── dto/               # PaginationQueryDto, PaginatedResultDto
│   │   │   │   ├── filters/           # HttpExceptionFilter (global)
│   │   │   │   ├── guards/            # JwtAuthGuard, RolesGuard
│   │   │   │   └── interceptors/      # ResponseInterceptor (global)
│   │   │   ├── config/
│   │   │   │   └── configuration.ts   # Baca semua env var jadi satu object
│   │   │   ├── modules/
│   │   │   │   ├── prisma/            # PrismaService + PrismaModule (global)
│   │   │   │   ├── auth/              # Login, refresh, logout
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── strategies/    # JwtStrategy (passport)
│   │   │   │   ├── users/             # CRUD user oleh admin
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── users.repository.ts
│   │   │   │   │   ├── users.service.ts
│   │   │   │   │   └── users.controller.ts
│   │   │   │   ├── savings/           # Dashboard saldo/target milik jamaah
│   │   │   │   ├── transactions/      # Setor/tarik, request→confirm/reject
│   │   │   │   ├── reports/           # Dashboard admin, laporan, export CSV
│   │   │   │   ├── notifications/     # Notifikasi per-user
│   │   │   │   └── profile/           # Profil sendiri + ubah password
│   │   │   ├── app.module.ts          # Root module, daftar semua modul
│   │   │   └── main.ts                # Bootstrap: helmet, cors, validation
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── mobile/                        # Expo (React Native) app
│       ├── app/                       # Expo Router — setiap file = 1 layar
│       │   ├── (auth)/
│       │   │   ├── welcome.tsx        # Splash/welcome
│       │   │   ├── login.tsx          # Login jamaah
│       │   │   └── admin-login.tsx    # Login admin
│       │   ├── (user)/                # Tab navigator jamaah
│       │   │   ├── _layout.tsx
│       │   │   ├── dashboard.tsx
│       │   │   ├── setor.tsx
│       │   │   ├── riwayat.tsx
│       │   │   ├── notifikasi.tsx
│       │   │   └── profil.tsx
│       │   ├── (admin)/               # Tab navigator admin
│       │   │   ├── _layout.tsx
│       │   │   ├── dashboard.tsx
│       │   │   ├── users/
│       │   │   │   ├── index.tsx      # Kelola User (list + search)
│       │   │   │   ├── create.tsx     # Tambah User
│       │   │   │   └── [id].tsx       # Detail/Edit/Hapus User
│       │   │   ├── transactions/
│       │   │   │   ├── index.tsx      # Kelola Transaksi + konfirmasi/tolak
│       │   │   │   └── create.tsx     # Tambah Setoran
│       │   │   ├── reports.tsx        # Laporan + export CSV
│       │   │   └── profil.tsx
│       │   ├── _layout.tsx            # Root: providers, auth hydration
│       │   └── index.tsx              # Redirect awal berdasar auth state
│       ├── src/
│       │   ├── api/                   # Satu file per domain, wrap Axios
│       │   ├── components/            # Button, Card, TextField, dst — reusable
│       │   ├── hooks/                 # React Query hooks per domain
│       │   ├── store/                 # Zustand: auth.store.ts
│       │   ├── constants/             # colors.ts, config.ts (design tokens)
│       │   ├── types/                 # Shared TypeScript types
│       │   └── utils/                 # format.ts, secure-storage.ts
│       ├── assets/                    # icon, splash, adaptive-icon
│       ├── app.json
│       ├── babel.config.js
│       ├── tailwind.config.js
│       ├── metro.config.js
│       └── package.json
│
├── packages/
│   └── config/                        # (placeholder) shared config/lint rules
│
├── docs/                              # Dokumen ini
├── docker-compose.yml                 # Postgres + server
├── turbo.json
├── pnpm-workspace.yaml
└── package.json                       # Root workspace
```

## Konvensi penamaan

- Modul backend: `*.controller.ts` (HTTP layer), `*.service.ts` (business
  logic), `*.repository.ts` (Prisma queries), `dto/*.dto.ts` (validasi input).
- Layar mobile: nama file = nama route (Expo Router file-based routing).
  Grup dalam kurung `(auth)`, `(user)`, `(admin)` tidak muncul di URL — hanya
  untuk mengelompokkan layout/navigator.
- Semua import lintas-domain di mobile pakai path relatif dari `src/`
  (alias `@/*` tersedia di `tsconfig.json` bila ingin dipakai).
