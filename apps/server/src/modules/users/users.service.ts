import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PaginatedResultDto } from '../../common/dto/paginated-result.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.usersRepository.findByPhoneNumber(dto.phoneNumber);
    if (existing) {
      throw new ConflictException('Nomor HP sudah terdaftar');
    }

    const userRole = await this.prisma.role.findUnique({ where: { name: 'USER' } });
    if (!userRole) {
      throw new NotFoundException('Role USER belum ada di database, jalankan seed terlebih dahulu');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersRepository.create({
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      passwordHash,
      role: { connect: { id: userRole.id } },
      savingAccount: {
        create: {
          currentBalance: 0,
          targetAmount: dto.targetAmount ?? 25000000,
        },
      },
    });

    return this.sanitize(user);
  }

  async findAll(query: QueryUsersDto) {
    const skip = (query.page - 1) * query.limit;
    const { data, total } = await this.usersRepository.findManyPaginated({
      skip,
      take: query.limit,
      search: query.search,
    });

    return new PaginatedResultDto(data.map((u) => this.sanitize(u)), total, query.page, query.limit);
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');
    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const updated = await this.usersRepository.update(id, dto);
    return this.sanitize(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.usersRepository.softDelete(id);
    return { message: 'Pengguna berhasil dihapus' };
  }

  private sanitize(user: Record<string, unknown>) {
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
  }
}
