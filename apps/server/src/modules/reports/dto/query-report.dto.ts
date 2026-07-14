import { IsIn, IsOptional } from 'class-validator';

export class QueryReportDto {
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly', 'yearly'])
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly';
}
