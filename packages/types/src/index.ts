export interface Balance {
  name: string;
  balance: number;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}
