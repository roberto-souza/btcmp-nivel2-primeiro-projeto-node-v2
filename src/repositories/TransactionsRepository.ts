import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = this.sumTransactionsByType('income', transactions);
    const outcome = this.sumTransactionsByType('outcome', transactions);
    const total = income - outcome;

    return { income, outcome, total };
  }

  private sumTransactionsByType(
    type: 'income' | 'outcome',
    transactions: Transaction[],
  ): number {
    const sum = transactions
      .filter(transaction => transaction.type === type)
      .map(transaction => Number(transaction.value))
      .reduce((x, y) => x + y, 0);

    return sum;
  }
}

export default TransactionsRepository;
