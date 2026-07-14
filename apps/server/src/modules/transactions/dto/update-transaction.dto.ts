import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber()
  @Min(1000)
  amount?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
