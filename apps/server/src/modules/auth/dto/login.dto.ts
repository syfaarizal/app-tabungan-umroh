import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoleName } from '@prisma/client';

export class LoginDto {
  @IsString()
  phoneNumber!: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(RoleName)
  role?: RoleName;
}
