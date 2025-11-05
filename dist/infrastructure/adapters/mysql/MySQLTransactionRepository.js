"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLTransactionRepository = void 0;
const Transaction_1 = require("../../../domain/entities/Transaction");
const TransactionEntity_1 = require("./entities/TransactionEntity");
class MySQLTransactionRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.repo = dataSource.getRepository(TransactionEntity_1.TransactionEntity);
    }
    async create(transaction) {
        const entity = this.toEntity(transaction);
        await this.repo.save(entity);
    }
    async findByAccountId(accountId) {
        const entities = await this.repo.find({
            where: { accountId },
            order: { createdAt: "DESC" }
        });
        return entities.map(e => this.toDomain(e));
    }
    async findByAccountIds(accountIds) {
        if (accountIds.length === 0)
            return [];
        const entities = await this.repo.find({
            where: accountIds.map(id => ({ accountId: id })),
            order: { createdAt: "DESC" }
        });
        return entities.map(e => this.toDomain(e));
    }
    toEntity(transaction) {
        const entity = new TransactionEntity_1.TransactionEntity();
        entity.id = transaction.id;
        entity.accountId = transaction.accountId;
        entity.type = transaction.type;
        entity.amount = transaction.amount;
        entity.label = transaction.label;
        entity.relatedAccountId = transaction.relatedAccountId;
        entity.relatedClientName = transaction.relatedClientName;
        entity.createdAt = transaction.createdAt;
        return entity;
    }
    toDomain(entity) {
        return new Transaction_1.Transaction(entity.id, entity.accountId, entity.type, Number(entity.amount), entity.label, entity.relatedAccountId, entity.relatedClientName, entity.createdAt);
    }
}
exports.MySQLTransactionRepository = MySQLTransactionRepository;
