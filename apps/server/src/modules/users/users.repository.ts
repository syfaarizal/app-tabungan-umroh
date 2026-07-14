import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Repository layer: isolates all Prisma query construction from the
 * service layer so business logic never touches the ORM directly.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByPhoneNumber(phoneNumber: string) {
    return this.prisma.user.findFirst({
      where: { phoneNumber, deletedAt: null },
    });
  }

  findById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true, savingAccount: true },
    });
  }

  async findManyPaginated(params: { skip: number; take: number; search?: string }) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      role: { name: 'USER' },
      ...(params.search
        ? {
            OR: [
              { fullName: { contains: params.search, mode: 'insensitive' } },
              { phoneNumber: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: { role: true, savingAccount: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data, include: { role: true } });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
