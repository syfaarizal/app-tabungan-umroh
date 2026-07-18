import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../common/services/audit.service';
import { PaginatedResultDto } from '../../common/dto/paginated-result.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsQueryDto } from './dto/audit-logs-query.dto';
import { LedgerQueryDto } from './dto/ledger-query.dto';
import { ManualAdjustmentDto } from './dto/manual-adjustment.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getLedger(query: LedgerQueryDto) {
    let savingAccountId: string | undefined;

    if (query.userId) {
      const account = await this.prisma.savingAccount.findFirst({
        where: { userId: query.userId, deletedAt: null },
      });
      if (!account) throw new NotFoundException('Rekening tabungan tidak ditemukan');
      savingAccountId = account.id;
    }

    const skip = ((query.page ?? 1) - 1) * (query.limit ?? 50);

    const where: Prisma.TransactionWhereInput = {
      deletedAt: null,
      ...(savingAccountId && { savingAccountId }),
      ...(query.type && { type: query.type }),
      ...(query.startDate && { transactionDate: { gte: new Date(query.startDate) } }),
      ...(query.endDate && { transactionDate: { lte: new Date(query.endDate) } }),
    };

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { transactionDate: 'asc' },
        skip,
        take: query.limit ?? 50,
        include: {
          savingAccount: { include: { user: { select: { id: true, fullName: true, phoneNumber: true } } } },
          recordedByAdmin: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    let cumulative = 0;
    if (transactions.length > 0) {
      if (savingAccountId) {
        const account = await this.prisma.savingAccount.findUnique({ where: { id: savingAccountId } });
        cumulative = Number(account?.currentBalance ?? 0);
        for (const tx of [...transactions].reverse()) {
          if (tx.type === 'DEPOSIT') cumulative -= Number(tx.amount);
          else cumulative += Number(tx.amount);
        }
      }
      const ledger = transactions.map((tx) => {
        if (tx.type === 'DEPOSIT') cumulative += Number(tx.amount);
        else cumulative -= Number(tx.amount);
        return { ...tx, cumulativeBalance: cumulative };
      });
      return new PaginatedResultDto(ledger, total, query.page ?? 1, query.limit ?? 50);
    }

    return new PaginatedResultDto([], total, query.page ?? 1, query.limit ?? 50);
  }

  async getAuditLogs(query: AuditLogsQueryDto) {
    const where: Prisma.AuditLogWhereInput = {
      ...(query.actionType && { actionType: query.actionType }),
      ...(query.performedBy && { performedById: query.performedBy }),
      ...(query.startDate && { createdAt: { gte: new Date(query.startDate) } }),
      ...(query.endDate && { createdAt: { lte: new Date(query.endDate) } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit ?? 50,
        include: {
          performedBy: { select: { id: true, fullName: true, phoneNumber: true } },
          targetUser: { select: { id: true, fullName: true, phoneNumber: true } },
          targetTransaction: { select: { id: true, amount: true, type: true, status: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return new PaginatedResultDto(data, total, 1, query.limit ?? 50);
  }

  async manualAdjustment(performedBy: string, dto: ManualAdjustmentDto) {
    const account = await this.prisma.savingAccount.findFirst({
      where: { userId: dto.userId, deletedAt: null },
      include: { user: { select: { id: true, fullName: true } } },
    });
    if (!account) throw new NotFoundException('Rekening tabungan tidak ditemukan');

    const oldBalance = Number(account.currentBalance);
    const oldValue = { currentBalance: oldBalance };
    const newBalance = oldBalance + dto.amount;
    const newValue = { currentBalance: newBalance };

    const [updatedAccount, auditLog] = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.savingAccount.update({
        where: { id: account.id },
        data: { currentBalance: newBalance },
      });
      const log = await tx.auditLog.create({
        data: {
          actionType: 'MANUAL_ADJUSTMENT',
          performedById: performedBy,
          targetUserId: dto.userId,
          amount: new Prisma.Decimal(dto.amount),
          reason: dto.reason ?? 'Manual adjustment',
          oldValue,
          newValue,
        },
      });
      return [updated, log];
    });

    return { newBalance: Number(updatedAccount.currentBalance), auditLog };
  }
}
