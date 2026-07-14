import { Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a transaction and atomically updates the saving account balance
   * in a single DB transaction so balance never drifts from history.
   */
  async recordTransaction(params: {
    savingAccountId: string;
    adminId: string;
    amount: number;
    type: TransactionType;
    note?: string;
    transactionDate?: Date;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          savingAccountId: params.savingAccountId,
          recordedByAdminId: params.adminId,
          amount: params.amount,
          type: params.type,
          note: params.note,
          transactionDate: params.transactionDate ?? new Date(),
          status: 'CONFIRMED',
        },
      });

      const balanceChange = params.type === 'DEPOSIT' ? params.amount : -params.amount;

      const account = await tx.savingAccount.update({
        where: { id: params.savingAccountId },
        data: { currentBalance: { increment: balanceChange } },
      });

      return { transaction, account };
    });
  }

  createPendingRequest(params: { savingAccountId: string; amount: number; note?: string; transactionDate?: Date }) {
    return this.prisma.transaction.create({
      data: {
        savingAccountId: params.savingAccountId,
        amount: params.amount,
        type: 'DEPOSIT',
        status: 'PENDING',
        note: params.note,
        transactionDate: params.transactionDate ?? new Date(),
      },
    });
  }

  findManyPaginated(params: {
    skip: number;
    take: number;
    savingAccountId?: string;
    type?: TransactionType;
  }) {
    const where: Prisma.TransactionWhereInput = {
      deletedAt: null,
      ...(params.savingAccountId ? { savingAccountId: params.savingAccountId } : {}),
      ...(params.type ? { type: params.type } : {}),
    };

    return this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { transactionDate: 'desc' },
        include: { recordedByAdmin: { select: { fullName: true } } },
      }),
      this.prisma.transaction.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.prisma.transaction.findFirst({ where: { id, deletedAt: null } });
  }

  update(id: string, data: Prisma.TransactionUpdateInput) {
    return this.prisma.transaction.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return this.prisma.transaction.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
