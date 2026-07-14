import { Module } from '@nestjs/common';
import { SavingsController } from './savings.controller';
import { SavingsRepository } from './savings.repository';
import { SavingsService } from './savings.service';

@Module({
  controllers: [SavingsController],
  providers: [SavingsService, SavingsRepository],
  exports: [SavingsService],
})
export class SavingsModule {}
