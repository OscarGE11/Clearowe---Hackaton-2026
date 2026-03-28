import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Expense } from './expense.entity';
import { Participant } from '../../groups/entities/participant.entity';

@Entity('expense_splits')
export class ExpenseSplit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Expense, (e) => e.splits, { onDelete: 'CASCADE' })
  expense: Expense;

  @Column()
  expenseId: string;

  @ManyToOne(() => Participant, (p) => p.splits)
  participant: Participant;

  @Column()
  participantId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;
}
