import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AuditService } from '../../common/services/audit.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, AuditService],
  exports: [DashboardService],
})
export class DashboardModule {}
