"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryTransactionRepository = void 0;
class InMemoryTransactionRepository {
    constructor() {
        this.transactions = new Map();
    }
    async create(transaction) {
        this.transactions.set(transaction.id, transaction);
    }
    async findByAccountId(accountId) {
        const result = [];
        for (const transaction of this.transactions.values()) {
            if (transaction.accountId === accountId) {
                result.push(transaction);
            }
        }
        return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async findByAccountIds(accountIds) {
        const result = [];
        for (const transaction of this.transactions.values()) {
            if (accountIds.includes(transaction.accountId)) {
                result.push(transaction);
            }
        }
        return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
}
exports.InMemoryTransactionRepository = InMemoryTransactionRepository;
