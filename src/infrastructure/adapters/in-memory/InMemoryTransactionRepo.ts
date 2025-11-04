import { TransactionRepository } from "../../../application/repositories/TransactionRepository";
import { Transaction } from "../../../domain/entities/Transaction";

export class InMemoryTransactionRepository implements TransactionRepository {
  private transactions = new Map<string, Transaction>();

  async create(transaction: Transaction): Promise<void> {
    this.transactions.set(transaction.id, transaction);
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    const result: Transaction[] = [];
    for (const transaction of this.transactions.values()) {
      if (transaction.accountId === accountId) {
        result.push(transaction);
      }
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByAccountIds(accountIds: string[]): Promise<Transaction[]> {
    const result: Transaction[] = [];
    for (const transaction of this.transactions.values()) {
      if (accountIds.includes(transaction.accountId)) {
        result.push(transaction);
      }
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

