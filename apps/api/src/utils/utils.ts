import type { Balance, Transaction } from '@clearowe/types';

const balances: Balance[] = [
  { name: 'Ana', balance: 15 },
  { name: 'Marta', balance: 25 },
  { name: 'Óscar', balance: -10 },
  { name: 'Luis', balance: -20 },
  { name: 'Paco', balance: -10 },
];

const sortBalance = (balances: Balance[], descending: boolean): Balance[] => {
  if (descending) return balances.sort((a, b) => b.balance - a.balance);
  else return balances.sort((a, b) => a.balance - b.balance);
};

export const balanceSorting = () => {
  let positiveBalance = balances.filter((balance) => balance.balance > 0);
  let negativeBalance = balances.filter((balance) => balance.balance < 0);
  const transactions: Transaction[] = [];

  positiveBalance = sortBalance(positiveBalance, true);
  negativeBalance = sortBalance(negativeBalance, false);

  while (positiveBalance.length && negativeBalance.length) {
    const topPositive = positiveBalance[0];
    const topNegative = negativeBalance[0];
    const transferAmount = Math.min(topPositive.balance, -topNegative.balance);

    topPositive.balance -= transferAmount;
    topNegative.balance += transferAmount;

    if (topPositive.balance <= 0) positiveBalance.shift();
    if (topNegative.balance >= 0) negativeBalance.shift();

    sortBalance(positiveBalance, true);
    sortBalance(negativeBalance, false);

    transactions.push({
      from: topNegative.name,
      to: topPositive.name,
      amount: transferAmount,
    });
  }

  return transactions;
};
