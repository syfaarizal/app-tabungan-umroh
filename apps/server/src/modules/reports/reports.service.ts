import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryReportDto } from './dto/query-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary() {
    const [totalUsers, totalSavings, todayDeposits, monthDeposits] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null, role: { name: 'USER' } } }),
      this.prisma.savingAccount.aggregate({
        _sum: { currentBalance: true },
        where: { deletedAt: null },
      }),
      this.sumDepositsSince(this.startOfToday()),
      this.sumDepositsSince(this.startOfMonth()),
    ]);

    return {
      totalUsers,
      totalSavings: Number(totalSavings._sum.currentBalance ?? 0),
      todayDeposit: todayDeposits,
      monthlyDeposit: monthDeposits,
    };
  }

  async getSummaryReport(query: QueryReportDto) {
    const since = this.resolveSince(query.period ?? 'monthly');

    const [transactions, aggregate] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { deletedAt: null, type: 'DEPOSIT', transactionDate: { gte: since } },
        orderBy: { transactionDate: 'desc' },
        include: {
          savingAccount: { include: { user: { select: { fullName: true, phoneNumber: true } } } },
        },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { deletedAt: null, type: 'DEPOSIT', transactionDate: { gte: since } },
      }),
    ]);

    const activeUserIds = new Set(transactions.map((t) => t.savingAccount.userId));

    return {
      period: query.period ?? 'monthly',
      totalDeposit: Number(aggregate._sum.amount ?? 0),
      transactionCount: aggregate._count,
      activeUserCount: activeUserIds.size,
      transactions,
    };
  }

  async exportCsv(query: QueryReportDto): Promise<string> {
    const report = await this.getSummaryReport(query);
    const header = 'Tanggal,Nama Jamaah,Nomor HP,Nominal,Keterangan,Dicatat Oleh\n';
    const rows = report.transactions.map((t) => {
      const date = t.transactionDate.toISOString().slice(0, 10);
      const name = t.savingAccount.user.fullName;
      const phone = t.savingAccount.user.phoneNumber;
      const amount = Number(t.amount);
      const note = (t.note ?? '').replace(/,/g, ';');
      return `${date},${name},${phone},${amount},${note}`;
    });
    return header + rows.join('\n');
  }

  private async sumDepositsSince(since: Date): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { deletedAt: null, type: 'DEPOSIT', transactionDate: { gte: since } },
    });
    return Number(result._sum.amount ?? 0);
  }

  private resolveSince(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Date {
    switch (period) {
      case 'daily':
        return this.startOfToday();
      case 'weekly': {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d;
      }
      case 'yearly': {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        return d;
      }
      case 'monthly':
      default:
        return this.startOfMonth();
    }
  }

  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private startOfMonth(): Date {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }
}
