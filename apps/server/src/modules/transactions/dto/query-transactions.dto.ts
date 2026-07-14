import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TransactionType } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryTransactionsDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}
