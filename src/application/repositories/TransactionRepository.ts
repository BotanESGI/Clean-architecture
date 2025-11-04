import { Transaction } from "../../domain/entities/Transaction";

export interface TransactionRepository {
  create(transaction: Transaction): Promise<void>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  findByAccountIds(accountIds: string[]): Promise<Transaction[]>;
}

