import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { ExpenseSplit } from '../../expenses/entities/expense-split.entity';

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Group, (g) => g.participants, { onDelete: 'CASCADE' })
  group: Group;

  @Column()
  groupId: string;

  @OneToMany(() => Expense, (e) => e.paidBy)
  expensesPaid: Expense[];

  @OneToMany(() => ExpenseSplit, (s) => s.participant)
  splits: ExpenseSplit[];
}
