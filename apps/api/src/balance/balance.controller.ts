import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BalanceService } from './balance.service';

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class BalanceController {
  constructor(private balanceService: BalanceService) {}

  @Get(':id/balance')
  getBalance(@Param('id') id: string) {
    return this.balanceService.getBalance(id);
  }
}
