import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Participant } from './participant.entity';
import { Expense } from '../../expenses/entities/expense.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (u) => u.groups)
  createdBy: User;

  @Column()
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Participant, (p) => p.group, { cascade: true })
  participants: Participant[];

  @OneToMany(() => Expense, (e) => e.group)
  expenses: Expense[];
}
