import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class ManualAdjustmentDto {
  @IsUUID()
  userId!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
