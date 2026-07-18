/*
  Warnings:

  - You are about to drop the column `action` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `entity` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `entity_id` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `audit_logs` table. All the data in the column will be lost.
  - Added the required column `action_type` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `performed_by_id` to the `audit_logs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('CREATE_USER', 'LOGIN', 'CREATE_TRANSACTION', 'CONFIRM_TRANSACTION', 'REJECT_TRANSACTION', 'DELETE_TRANSACTION', 'MANUAL_ADJUSTMENT');

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "action",
DROP COLUMN "entity",
DROP COLUMN "entity_id",
DROP COLUMN "metadata",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     \"action_type\" \"AuditActionType\" NOT NULL DEFAULT 'CREATE_TRANSACTION',
ADD COLUMN     "amount" DECIMAL(14,2),
ADD COLUMN     "new_value" JSONB,
ADD COLUMN     "old_value" JSONB,
ADD COLUMN     "performed_by_id" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "target_transaction_id" TEXT,
ADD COLUMN     "target_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_target_transaction_id_fkey" FOREIGN KEY ("target_transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
