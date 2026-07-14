import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateDepositRequestDto } from './dto/create-deposit-request.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  create(@CurrentUser() admin: AuthenticatedUser, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(admin.id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  findAll(@Query() query: QueryTransactionsDto) {
    return this.transactionsService.findAll(query);
  }

  @Get('me')
  findMyHistory(@CurrentUser() user: AuthenticatedUser, @Query() query: QueryTransactionsDto) {
    return this.transactionsService.findMyHistory(user, query);
  }

  @Post('request')
  createDepositRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDepositRequestDto,
  ) {
    return this.transactionsService.createDepositRequest(user.id, dto);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  confirmRequest(@CurrentUser() admin: AuthenticatedUser, @Param('id') id: string) {
    return this.transactionsService.confirmRequest(admin.id, id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  rejectRequest(@CurrentUser() admin: AuthenticatedUser, @Param('id') id: string) {
    return this.transactionsService.rejectRequest(admin.id, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
