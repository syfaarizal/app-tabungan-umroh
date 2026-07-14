import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { RoleName } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { QueryReportDto } from './dto/query-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.reportsService.getDashboardSummary();
  }

  @Get('summary')
  getSummary(@Query() query: QueryReportDto) {
    return this.reportsService.getSummaryReport(query);
  }

  @Get('export')
  async export(@Query() query: QueryReportDto, @Res() res: Response) {
    const csv = await this.reportsService.exportCsv(query);
    res.header('Content-Type', 'text/csv');
    res.attachment(`laporan-${query.period ?? 'monthly'}.csv`);
    res.send(csv);
  }
}
