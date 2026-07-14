import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDepositRequestDto {
  @IsNumber()
  @Min(1000)
  amount!: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  transactionDate?: string;
}
