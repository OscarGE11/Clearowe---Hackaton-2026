import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { ExpenseSplit } from './entities/expense-split.entity';
import { Participant } from '../groups/entities/participant.entity';
import { Group } from '../groups/entities/group.entity';
import { AiModule } from '../ai/ai.module';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, ExpenseSplit, Participant, Group]),
    AiModule,
  ],
  providers: [ExpensesService],
  controllers: [ExpensesController],
})
export class ExpensesModule {}
