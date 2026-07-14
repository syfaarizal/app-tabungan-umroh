import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.savingAccount.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  updateTarget(userId: string, targetAmount: number) {
    return this.prisma.savingAccount.update({
      where: { userId },
      data: { targetAmount },
    });
  }

  aggregateTotals() {
    return this.prisma.savingAccount.aggregate({
      _sum: { currentBalance: true },
      where: { deletedAt: null },
    });
  }
}
