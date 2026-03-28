import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from '../groups/entities/participant.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Group } from '../groups/entities/group.entity';

interface BalanceEntry {
  participant: { id: string; name: string };
  net: number;
}

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Group) private groupsRepo: Repository<Group>,
    @InjectRepository(Participant)
    private participantsRepo: Repository<Participant>,
    @InjectRepository(Expense) private expensesRepo: Repository<Expense>,
  ) {}

  async getBalance(groupId: string) {
    const group = await this.groupsRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Grupo no encontrado');

    const participants = await this.participantsRepo.find({
      where: { groupId },
    });
    const expenses = await this.expensesRepo.find({
      where: { groupId },
      relations: ['splits'],
    });

    // Net balance per participant: positive = owed money, negative = owes money
    const netMap = new Map<string, BalanceEntry>();
    participants.forEach((p) => {
      netMap.set(p.id, { participant: { id: p.id, name: p.name }, net: 0 });
    });

    expenses.forEach((expense) => {
      // The payer is owed the full amount
      const payer = netMap.get(expense.paidById);
      if (payer) payer.net += Number(expense.amount);

      // Each participant in the split owes their share
      expense.splits.forEach((split) => {
        const entry = netMap.get(split.participantId);
        if (entry) entry.net -= Number(split.amount);
      });
    });

    const balances = Array.from(netMap.values()).map((b) => ({
      ...b,
      net: Math.round(b.net * 100) / 100,
    }));

    const transactions = this.minimizeTransactions([...balances]);

    return { balances, transactions };
  }

  private minimizeTransactions(balances: BalanceEntry[]) {
    const creditors = balances
      .filter((b) => b.net > 0.01)
      .sort((a, b) => b.net - a.net);
    const debtors = balances
      .filter((b) => b.net < -0.01)
      .sort((a, b) => a.net - b.net);

    const transactions: {
      from: { id: string; name: string };
      to: { id: string; name: string };
      amount: number;
    }[] = [];

    while (creditors.length && debtors.length) {
      const creditor = creditors[0];
      const debtor = debtors[0];

      const amount = Math.min(creditor.net, -debtor.net);
      const rounded = Math.round(amount * 100) / 100;

      transactions.push({
        from: debtor.participant,
        to: creditor.participant,
        amount: rounded,
      });

      creditor.net -= amount;
      debtor.net += amount;

      if (creditor.net < 0.01) creditors.shift();
      if (debtor.net > -0.01) debtors.shift();
    }

    return transactions;
  }
}
