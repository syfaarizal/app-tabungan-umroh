import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResultDto } from '../../common/dto/paginated-result.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepositRequestDto } from './dto/create-deposit-request.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(adminId: string, dto: CreateTransactionDto) {
    const account = await this.prisma.savingAccount.findFirst({
      where: { userId: dto.userId, deletedAt: null },
    });
    if (!account) throw new NotFoundException('Rekening tabungan pengguna tidak ditemukan');

    const { transaction, account: updatedAccount } =
      await this.transactionsRepository.recordTransaction({
        savingAccountId: account.id,
        adminId,
        amount: dto.amount,
        type: dto.type ?? 'DEPOSIT',
        note: dto.note,
        transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : undefined,
      });

    await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: 'DEPOSIT_CONFIRMED',
        title: 'Setoran berhasil dicatat',
        message: `Setoran sebesar Rp${dto.amount.toLocaleString('id-ID')} telah dicatat oleh admin.`,
      },
    });

    return { transaction, currentBalance: Number(updatedAccount.currentBalance) };
  }

  /**
   * User-initiated deposit request. Creates a PENDING transaction that does
   * NOT touch the balance yet — balance only moves once an admin confirms it.
   * This mirrors the mobile "Setor Tabungan" flow shown to jamaah.
   */
  async createDepositRequest(userId: string, dto: CreateDepositRequestDto) {
    const account = await this.prisma.savingAccount.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!account) throw new NotFoundException('Rekening tabungan tidak ditemukan');

    const request = await this.transactionsRepository.createPendingRequest({
      savingAccountId: account.id,
      amount: dto.amount,
      note: dto.note,
      transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : undefined,
    });

    const admins = await this.prisma.user.findMany({
      where: { deletedAt: null, role: { name: 'ADMIN' } },
      select: { id: true },
    });
    await this.prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: 'SYSTEM' as const,
        title: 'Permintaan setoran baru',
        message: `Ada permintaan setoran sebesar Rp${dto.amount.toLocaleString('id-ID')} menunggu konfirmasi.`,
      })),
    });

    return request;
  }

  async confirmRequest(adminId: string, id: string) {
    const existing = await this.transactionsRepository.findById(id);
    if (!existing) throw new NotFoundException('Permintaan setoran tidak ditemukan');
    if (existing.status !== 'PENDING') {
      throw new ForbiddenException('Permintaan ini sudah diproses sebelumnya');
    }

    const account = await this.prisma.savingAccount.findFirst({
      where: { id: existing.savingAccountId },
    });
    if (!account) throw new NotFoundException('Rekening tabungan tidak ditemukan');

    const [transaction] = await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id },
        data: { status: 'CONFIRMED', recordedByAdminId: adminId },
      }),
      this.prisma.savingAccount.update({
        where: { id: account.id },
        data: { currentBalance: { increment: Number(existing.amount) } },
      }),
    ]);

    await this.prisma.notification.create({
      data: {
        userId: account.userId,
        type: 'DEPOSIT_CONFIRMED',
        title: 'Setoran dikonfirmasi',
        message: `Setoran sebesar Rp${Number(existing.amount).toLocaleString('id-ID')} telah dikonfirmasi.`,
      },
    });

    return transaction;
  }

  async rejectRequest(adminId: string, id: string) {
    const existing = await this.transactionsRepository.findById(id);
    if (!existing) throw new NotFoundException('Permintaan setoran tidak ditemukan');
    if (existing.status !== 'PENDING') {
      throw new ForbiddenException('Permintaan ini sudah diproses sebelumnya');
    }

    const account = await this.prisma.savingAccount.findFirst({
      where: { id: existing.savingAccountId },
    });

    const transaction = await this.transactionsRepository.update(id, {
      status: 'REJECTED',
      recordedByAdmin: { connect: { id: adminId } },
    });

    if (account) {
      await this.prisma.notification.create({
        data: {
          userId: account.userId,
          type: 'DEPOSIT_REJECTED',
          title: 'Setoran ditolak',
          message: 'Permintaan setoran Anda ditolak oleh admin. Silakan hubungi admin untuk info lebih lanjut.',
        },
      });
    }

    return transaction;
  }

  async findAll(query: QueryTransactionsDto) {
    const skip = (query.page - 1) * query.limit;

    let savingAccountId: string | undefined;
    if (query.userId) {
      const account = await this.prisma.savingAccount.findFirst({
        where: { userId: query.userId, deletedAt: null },
      });
      savingAccountId = account?.id;
    }

    const [data, total] = await this.transactionsRepository.findManyPaginated({
      skip,
      take: query.limit,
      savingAccountId,
      type: query.type,
    });

    return new PaginatedResultDto(data, total, query.page, query.limit);
  }

  async findMyHistory(user: AuthenticatedUser, query: QueryTransactionsDto) {
    const account = await this.prisma.savingAccount.findFirst({
      where: { userId: user.id, deletedAt: null },
    });
    if (!account) throw new NotFoundException('Rekening tabungan tidak ditemukan');

    const skip = (query.page - 1) * query.limit;
    const [data, total] = await this.transactionsRepository.findManyPaginated({
      skip,
      take: query.limit,
      savingAccountId: account.id,
      type: query.type,
    });

    return new PaginatedResultDto(data, total, query.page, query.limit);
  }

  async update(id: string, dto: UpdateTransactionDto) {
    const existing = await this.transactionsRepository.findById(id);
    if (!existing) throw new NotFoundException('Transaksi tidak ditemukan');

    // Amount changes must go through balance-adjusting logic, not a plain update,
    // to avoid the ledger and balance drifting apart.
    if (dto.amount !== undefined && Number(existing.amount) !== dto.amount) {
      const delta = dto.amount - Number(existing.amount);
      const balanceChange = existing.type === 'DEPOSIT' ? delta : -delta;

      await this.prisma.$transaction([
        this.prisma.transaction.update({
          where: { id },
          data: { amount: dto.amount, note: dto.note ?? existing.note },
        }),
        this.prisma.savingAccount.update({
          where: { id: existing.savingAccountId },
          data: { currentBalance: { increment: balanceChange } },
        }),
      ]);
    } else if (dto.note !== undefined) {
      await this.transactionsRepository.update(id, { note: dto.note });
    }

    return this.transactionsRepository.findById(id);
  }

  async remove(id: string) {
    const existing = await this.transactionsRepository.findById(id);
    if (!existing) throw new NotFoundException('Transaksi tidak ditemukan');
    if (existing.deletedAt) throw new ForbiddenException('Transaksi sudah dihapus sebelumnya');

    const balanceChange =
      existing.type === 'DEPOSIT' ? -Number(existing.amount) : Number(existing.amount);

    await this.prisma.$transaction([
      this.prisma.transaction.update({ where: { id }, data: { deletedAt: new Date() } }),
      this.prisma.savingAccount.update({
        where: { id: existing.savingAccountId },
        data: { currentBalance: { increment: balanceChange } },
      }),
    ]);

    return { message: 'Transaksi berhasil dihapus' };
  }
}
