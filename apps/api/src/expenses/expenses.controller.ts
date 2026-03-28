import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post('groups/:groupId/expenses')
  create(@Param('groupId') groupId: string, @Body() dto: CreateExpenseDto) {
    return this.expensesService.create(groupId, dto);
  }

  @Get('groups/:groupId/expenses')
  findAll(@Param('groupId') groupId: string) {
    return this.expensesService.findAll(groupId);
  }

  @Delete('expenses/:id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
