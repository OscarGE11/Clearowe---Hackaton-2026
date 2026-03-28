import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../groups/entities/group.entity';
import { Participant } from '../groups/entities/participant.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Participant, Expense])],
  providers: [BalanceService],
  controllers: [BalanceController],
})
export class BalanceModule {}
