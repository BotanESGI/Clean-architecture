import { TransactionRepository } from "../repositories/TransactionRepository";

export class ListTransactions {
  constructor(private transactionRepo: TransactionRepository) {}

  async execute(accountIds: string[]) {
    return await this.transactionRepo.findByAccountIds(accountIds);
  }
}

