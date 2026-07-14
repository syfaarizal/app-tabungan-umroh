import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsUUID()
  userId!: string;

  @IsNumber()
  @Min(1000)
  amount!: number;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType = TransactionType.DEPOSIT;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  transactionDate?: string;
}
