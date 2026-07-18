import { Injectable } from '@nestjs/common';
import { AuditActionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../modules/prisma/prisma.service';

export interface AuditLogData {
  actionType: AuditActionType;
  performedBy: string;
  targetUserId?: string;
  targetTransactionId?: string;
  amount?: Prisma.Decimal;
  reason?: string;
  oldValue?: Prisma.JsonValue;
  newValue?: Prisma.JsonValue;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: AuditLogData) {
    return this.prisma.auditLog.create({
      data: {
        actionType: data.actionType,
        performedById: data.performedBy,
        targetUserId: data.targetUserId,
        targetTransactionId: data.targetTransactionId,
        amount: data.amount,
        reason: data.reason,
        oldValue: data.oldValue ?? Prisma.JsonNull,
        newValue: data.newValue ?? Prisma.JsonNull,
      },
    });
  }
}
