import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Prisma, RoleName } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Handles credential verification and token issuance/rotation.
 * Refresh tokens are stored hashed (never plaintext) so a leaked DB dump
 * does not expose usable tokens.
 *
 * Login rules:
 * - USER role: phone number only, no password required
 * - ADMIN role: phone number + password required
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { phoneNumber: dto.phoneNumber, deletedAt: null, isActive: true },
      include: { role: true },
    });

    if (!user) {
      throw new BadRequestException('Nomor HP tidak terdaftar');
    }

    // ADMIN always requires password
    if (user.role.name === RoleName.ADMIN) {
      if (!dto.password) {
        throw new UnauthorizedException('Password wajib diisi untuk admin');
      }
      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Password salah');
      }
    }
    // USER role: phone number only, no password check

    const tokens = await this.issueTokens(user.id, user.phoneNumber, user.role.name);

    await this.prisma.auditLog.create({
      data: {
        actionType: 'LOGIN',
        performedById: user.id,
        reason: `Login sebagai ${user.role.name}`,
        oldValue: Prisma.JsonNull,
        newValue: Prisma.JsonNull,
      },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role.name,
      },
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid');
    }

    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, tokenHash, revoked: false },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Sesi telah berakhir, silakan login kembali');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null, isActive: true },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan');
    }

    // Rotate: revoke the old refresh token and issue a new pair
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    return this.issueTokens(user.id, user.phoneNumber, user.role.name);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { userId, tokenHash, revoked: false },
      data: { revoked: true },
    });
  }

  private async issueTokens(userId: string, phoneNumber: string, role: string): Promise<AuthTokens> {
    const payload = { sub: userId, phoneNumber, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    const expiresInDays = this.parseExpiryToDays(
      this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d',
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiryToDays(expiresIn: string): number {
    const match = /^(\d+)d$/.exec(expiresIn);
    return match ? parseInt(match[1], 10) : 7;
  }
}
