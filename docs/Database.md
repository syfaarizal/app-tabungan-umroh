# Database

PostgreSQL 16. Skema didefinisikan di `apps/server/prisma/schema.prisma`.
Semua tabel bisnis (bukan tabel penghubung/log) punya `created_at`,
`updated_at`, dan `deleted_at` (soft delete) — data tidak pernah benar-benar
dihapus, hanya ditandai.

## ERD (ringkas)

```
roles ──1───n── users ──1───1── saving_accounts ──1───n── transactions
                  │                                            │
                  1                                            n
                  │                                            │
                  n                                            │
             refresh_tokens                          (recorded_by_admin_id → users)
                  │
                  n
                  │
                  1
                users ──1───n── audit_logs
                users ──1───n── notifications

settings (tabel key-value mandiri, tidak berelasi)
```

## Tabel

### `roles`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| name | enum(`ADMIN`, `USER`) | unique |

### `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| full_name | string | |
| phone_number | string | unique — dipakai untuk login |
| email | string? | unique, opsional |
| password_hash | string | bcrypt, tidak pernah dikembalikan lewat API |
| is_active | boolean | dipakai untuk soft-disable akun |
| role_id | uuid | FK → `roles.id` |
| deleted_at | timestamp? | soft delete |

### `saving_accounts`
Satu akun tabungan per user (relasi 1-1).

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → `users.id`, unique |
| current_balance | decimal(14,2) | **hanya diubah lewat transaksi**, tidak pernah di-update langsung |
| target_amount | decimal(14,2) | target tabungan umroh |

### `transactions`
Ledger — sumber kebenaran untuk histori dan saldo.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| saving_account_id | uuid | FK → `saving_accounts.id` |
| type | enum(`DEPOSIT`, `WITHDRAWAL`) | |
| status | enum(`PENDING`, `CONFIRMED`, `REJECTED`) | `PENDING` untuk permintaan jamaah yang belum diproses admin |
| amount | decimal(14,2) | |
| note | string? | |
| transaction_date | timestamp | tanggal transaksi (bisa beda dari `created_at`) |
| recorded_by_admin_id | uuid? | FK → `users.id`, null jika masih `PENDING` |

**Indeks**: `(saving_account_id, transaction_date)` — mempercepat query
riwayat per akun terurut tanggal.

### `refresh_tokens`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → `users.id` |
| token_hash | string | SHA-256 dari refresh token, bukan plaintext |
| expires_at | timestamp | |
| revoked | boolean | di-set `true` saat rotasi/logout |

### `audit_logs`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| user_id | uuid? | siapa yang melakukan aksi |
| action | string | mis. `LOGIN` |
| entity | string | mis. `User` |
| entity_id | string? | |
| metadata | json? | data tambahan bebas |

### `settings`
Key-value store untuk konfigurasi aplikasi (mis. `default_target_amount`).

### `notifications`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → `users.id`, penerima |
| type | enum(`DEPOSIT_CONFIRMED`, `DEPOSIT_REJECTED`, `TARGET_MILESTONE`, `SYSTEM`) | |
| title / message | string | |
| is_read | boolean | |

## Kenapa saldo terpisah dari ledger

`saving_accounts.current_balance` adalah nilai yang di-cache dari total
`transactions` untuk performa (dashboard tidak perlu SUM() setiap kali
dibuka). Untuk menjaga konsistensi, **satu-satunya jalan mengubah
`current_balance` adalah lewat `TransactionsRepository`**, yang selalu
membungkus perubahan ledger + saldo dalam satu database transaction
(`prisma.$transaction`). Lihat `docs/Architecture.md` bagian "Konsistensi
saldo tabungan" untuk detail alurnya.

## Migrasi

```bash
cd apps/server
pnpm prisma:migrate        # development — membuat migration baru dari schema
pnpm prisma:migrate:deploy # production — menjalankan migration yang sudah ada
pnpm prisma:studio         # GUI untuk lihat/edit data langsung
```
