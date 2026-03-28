import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { Participant } from '../../groups/entities/participant.entity';
import { ExpenseSplit } from './expense-split.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group, (g) => g.expenses, { onDelete: 'CASCADE' })
  group: Group;

  @Column()
  groupId: string;

  @Column({ nullable: true })
  rawText: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'EUR' })
  currency: string;

  @ManyToOne(() => Participant, (p) => p.expensesPaid)
  paidBy: Participant;

  @Column()
  paidById: string;

  @OneToMany(() => ExpenseSplit, (s) => s.expense, { cascade: true })
  splits: ExpenseSplit[];

  @CreateDateColumn()
  createdAt: Date;
}
