"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTransactions = void 0;
class ListTransactions {
    constructor(transactionRepo) {
        this.transactionRepo = transactionRepo;
    }
    async execute(accountIds) {
        return await this.transactionRepo.findByAccountIds(accountIds);
    }
}
exports.ListTransactions = ListTransactions;
