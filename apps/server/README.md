# Tabungan Umroh — Backend API

NestJS + Prisma + PostgreSQL. Clean architecture with Repository Pattern,
Service Layer, DTOs, and role-based JWT auth (Admin / User).

## Requirements

- Node.js 20+
- pnpm 9+ (or npm)
- Docker + Docker Compose (for PostgreSQL)

## Setup

```bash
# 1. From the repo root, start PostgreSQL
docker compose up -d postgres

# 2. Install dependencies
cd apps/server
pnpm install   # or: npm install

# 3. Configure environment
cp .env.example .env
# edit .env if needed (defaults match docker-compose.yml)

# 4. Generate Prisma client & run migrations
pnpm prisma:generate
pnpm prisma:migrate

# 5. Seed the database (creates admin + sample jamaah)
pnpm prisma:seed

# 6. Run the API
pnpm start:dev
```

API will be available at `http://localhost:3000/api/v1`.

## Seeded accounts

| Role  | Phone         | Password   |
|-------|---------------|------------|
| Admin | 081234567890  | Admin123!  |
| User  | 081111111111  | User123!   |

## Running everything with Docker

```bash
docker compose up -d --build
docker compose exec server npx prisma migrate deploy
docker compose exec server npx prisma db seed
```

## Key endpoints

- `POST /auth/login` — login, returns access + refresh token
- `POST /auth/refresh` — rotate refresh token
- `POST /auth/logout`
- `GET/POST/PATCH/DELETE /users` — admin user management
- `GET /savings/me` — user's own balance/target/progress
- `POST /transactions` — admin records a deposit/withdrawal
- `GET /transactions/me` — user's own transaction history
- `GET /transactions` — admin: all transactions (paginated, filterable)
- `GET /reports/dashboard` — admin dashboard summary
- `GET /reports/summary?period=daily|weekly|monthly|yearly`
- `GET /reports/export?period=...` — CSV export
- `GET /notifications/me`

See `/docs/API.md` at the repo root for full request/response contracts.
