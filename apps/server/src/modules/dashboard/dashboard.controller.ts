import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleName } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { DashboardService } from './dashboard.service';
import { AuditLogsQueryDto } from './dto/audit-logs-query.dto';
import { LedgerQueryDto } from './dto/ledger-query.dto';
import { ManualAdjustmentDto } from './dto/manual-adjustment.dto';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(RoleName.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('ledger')
  getLedger(@Query() query: LedgerQueryDto) {
    return this.dashboardService.getLedger(query);
  }

  @Get('audit-logs')
  getAuditLogs(@Query() query: AuditLogsQueryDto) {
    return this.dashboardService.getAuditLogs(query);
  }

  @Post('manual-adjustment')
  manualAdjustment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ManualAdjustmentDto,
  ) {
    return this.dashboardService.manualAdjustment(user.id, dto);
  }
}
